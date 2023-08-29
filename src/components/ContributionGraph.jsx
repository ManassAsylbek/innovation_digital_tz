import {subWeeks, startOfWeek, addDays, format, parse, eachMonthOfInterval} from 'date-fns';
import {ru} from 'date-fns/locale';
import {useEffect, useState,useRef} from "react";


const Popover = ({content, children,}) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);
    const parsedDate = parse(content[0][0], 'yyyy-MM-dd', new Date());
    const togglePopover = () => {
        setIsOpen(!isOpen);
    };


    const handleClickOutside = (event) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    return (
        <div className="popover-container"  ref={popoverRef}>
            {isOpen && (
                <div className="popover-content">
                    <div className={"popover-title"}>{content[0][1]} contributions</div>
                    <div className={"popover-text"}>{format(parsedDate, 'EEEE, MMMM d, yyyy', {locale: ru})} </div>
                </div>
            )}
            <div className="popover-trigger" onClick={togglePopover}>
                {children}
            </div>

        </div>
    );
};





const ContributionGraph = () => {
    const [valuesObject, setValuesObject] = useState({})
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentDate = new Date();

    const textCurrentDay = format(currentDate, 'yyyy-MM-dd')

    const weeksAgo = subWeeks(currentDate, 50);

    const weekArray = Array.from({length: 51}, (_, index) => {
        const weekStart = startOfWeek(addDays(weeksAgo, index * 7), {weekStartsOn: 1});
        const weekDays = Array.from({length: 7}, (_, dayIndex) => {
            const day = addDays(weekStart, dayIndex);
            return {[format(day, 'yyyy-MM-dd')]: 0, color: ""};
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


    function binarySearch(arr, targetDate) {
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


    useEffect(() => {
        const newArr = weekArray.map(innerArray => {
            const arr = innerArray.map(item => {

                let dateKey = Object.keys(item)[0];
                console.log(Object.keys(item)[0])// Получаем дату из ключа объекта
                if (valuesObject[dateKey] !== undefined) {
                    // Проверяем, есть ли значение для этой даты
                    if (valuesObject[dateKey] === 0) {
                        item[dateKey] = valuesObject[dateKey]
                        item.color = "gray"
                    }
                    if ( 9>= valuesObject[dateKey] && valuesObject[dateKey] > 0) {
                        item[dateKey] = valuesObject[dateKey]
                        item.color = "lightBlue"
                    }
                    if (19 >= valuesObject[dateKey] && valuesObject[dateKey] >= 10) {
                        item[dateKey] = valuesObject[dateKey]
                        item.color = "blue"
                    }
                    if (30 >= valuesObject[dateKey] && valuesObject[dateKey] >= 20 ) {
                        item[dateKey] = valuesObject[dateKey]
                        item.color = "darkBlue"
                    }
                    if (valuesObject[dateKey] >= 31) {
                        item[dateKey] = valuesObject[dateKey]
                        item.color = "blackBlue"
                    }
                    // item[dateKey] = valuesObject[dateKey]; // Присваиваем значение
                }
                return item
            })
            return arr
        })
        setData(newArr)
    }, [valuesObject])

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
                console.log(data)
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
                                            <Popover content={Object.entries(dateGroup[dayIndex])}>
                                                <div className={`day ${dateGroup[dayIndex].color}`}/>
                                            </Popover>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={"gradient"}>
                        <span>Меньше</span>
                        <Popover content={[[textCurrentDay,"No"]]}>
                            <span className={"box gray"}></span>
                        </Popover>
                        <Popover content={[[textCurrentDay,"1-9"]]}>
                            <span className={"box lightBlue"}></span>
                        </Popover>
                        <Popover content={[[textCurrentDay,"10-19"]]}>
                            <span className={"box blue"}></span>
                        </Popover>
                        <Popover content={[[textCurrentDay,"20-29"]]}>
                            <span className={"box darkBlue"}></span>
                        </Popover>
                        <Popover content={[[textCurrentDay,"+30"]]}>
                            <span className={"box blackBlue"}></span>
                        </Popover>
                        <span>Больше</span>
                    </div>
                </div>
            }
        </>
    )
        ;
};

export default ContributionGraph;