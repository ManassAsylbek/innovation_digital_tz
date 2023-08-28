import {subWeeks, startOfWeek, addDays, format, differenceInMonths, eachMonthOfInterval} from 'date-fns';
import {ru} from 'date-fns/locale';
import  {useEffect, useState} from "react";

const ContributionGraph = () => {
    const [valuesObject, setValuesObject] = useState({})
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentDate = new Date();
    const weeksAgo = subWeeks(currentDate, 50);

    const weekArray = Array.from({length: 51}, (_, index) => {
        const weekStart = startOfWeek(addDays(weeksAgo, index * 7), {weekStartsOn: 1});
        const weekDays = Array.from({length: 7}, (_, dayIndex) => {
            const day = addDays(weekStart, dayIndex);
            return {[format(day, 'yyyy-MM-dd')]: ""};
        });
        return weekDays;
    });


    const monthsArray = eachMonthOfInterval({
        start: weeksAgo,
        end: currentDate,
    });
    const formattedMonths = monthsArray.map(date => format(date, 'MMMM', {locale: ru}));


    const getDayOfWeek = (dayIndex) => {
        const daysOfWeek = ['Пн', '', 'Ср', '', 'Пт', '', ''];
        return daysOfWeek[dayIndex];
    };


    function binarySearch(arr , targetDate) {
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const currentDate = Object.keys(arr[mid])[0];

            if (new Date(currentDate) === new Date(targetDate)) {
                return mid;
            } else if (new Date(currentDate) < new Date(targetDate)) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return -1; // Дата не найдена
    }


useEffect(()=>{
    const newArr = weekArray.map(innerArray => {
        const arr = innerArray.map(item => {

            let dateKey = Object.keys(item)[0]; // Получаем дату из ключа объекта
            if (valuesObject[dateKey] !== undefined) {
                // Проверяем, есть ли значение для этой даты
                if (valuesObject[dateKey] === 0) item[dateKey] = "gray"
                if (10 > valuesObject[dateKey] > 0) item[dateKey] = "lightBlue"
                if (20 > valuesObject[dateKey] > 9) item[dateKey] = "blue"
                if (31 > valuesObject[dateKey] > 19) item[dateKey] = "darkBlue"
                if (valuesObject[dateKey] > 30) item[dateKey] = "blackBlue"
                // item[dateKey] = valuesObject[dateKey]; // Присваиваем значение
            }
            return item
        })
        return arr
    })
    setData(newArr)
},[valuesObject])

    useEffect(() => {
        // Выполняем fetch запрос при монтировании компонента
        fetch('https://dpg.gg/test/calendar.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setValuesObject(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }


    return (<>
            {valuesObject && data &&
                <div className={"Table"}>
                    <div>
                        <div className={"title"}>{formattedMonths.map(item => (
                            <div className={""}>
                                {item}
                            </div>))}</div>

                        <table>
                            <thead>
                            <tr>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>

                            </tr>
                            {data[0].map((_, dayIndex) => (
                                <tr key={dayIndex}>
                                    <td>{getDayOfWeek(dayIndex)}</td>
                                    {data?.map((dateGroup, index) => (
                                        <td key={index}>
                                            <div
                                                className={`day ${Object.values(dateGroup[dayIndex])}`}/>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={"gradient"}>
                        <span>Меньше</span>
                        <span className={"box gray"}></span>
                        <span className={"box lightBlue"}></span>
                        <span className={"box blue"}></span>
                        <span className={"box darkBlue"}></span>
                        <span className={"box blackBlue"}></span>
                        <span>Больше</span>
                    </div>
                </div>
            }
        </>
    )
        ;
};

export default ContributionGraph;