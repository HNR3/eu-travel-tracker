import React, { useState, useEffect } from 'react';
import './App.css';

const calculateDaysInEU = (periods) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 180);

    let daysInEU = 0;
    let oldestDateWithin180Days = null;

    periods.forEach(period => {
        const periodStart = new Date(period.start_date);
        const periodEnd = new Date(period.end_date);
        periodEnd.setDate(periodEnd.getDate() + 1); // Include the departure day

        if (periodStart >= startDate && (!oldestDateWithin180Days || periodStart < oldestDateWithin180Days)) {
            oldestDateWithin180Days = periodStart;
        }

        const overlapStart = periodStart > startDate ? periodStart : startDate;
        const overlapEnd = periodEnd < today ? periodEnd : today;

        if (overlapStart <= overlapEnd) {
            const days = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
            daysInEU += days;
        }
    });

    const expiryDate = oldestDateWithin180Days ? calculateExpiryDate(oldestDateWithin180Days) : null;
    return { daysInEU, expiryDate };
};

const calculateExpiryDate = (startDate) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + 180);
    return start.toISOString().split('T')[0];
};

const App = () => {
    const [periods, setPeriods] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [daysInEU, setDaysInEU] = useState(0);
    const [expiryDate, setExpiryDate] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/periods')
            .then(response => response.json())
            .then(data => {
                const results = calculateDaysInEU(data);
                setPeriods(data);
                setDaysInEU(results.daysInEU);
                setExpiryDate(results.expiryDate);
            })
            .catch(error => {
                console.error('Error fetching periods:', error);
            });
    }, []);

    const addPeriod = async () => {
        if (!startDate || !endDate) {
            alert('Please enter both start date and end date.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/periods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startDate, endDate }),
            });
            const data = await response.json();
            const newPeriods = [...periods, data];
            const results = calculateDaysInEU(newPeriods);
            setPeriods(newPeriods);
            setDaysInEU(results.daysInEU);
            setExpiryDate(results.expiryDate);
            setStartDate('');
            setEndDate('');
        } catch (error) {
            console.error('Error adding period:', error);
        }
    };

    const deletePeriod = async (startDate, endDate) => {
        try {
            const response = await fetch('http://localhost:5000/api/periods', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startDate, endDate }),
            });
            const data = await response.json();
            if (response.ok) {
                const updatedPeriods = periods.filter(period => period.start_date !== startDate || period.end_date !== endDate);
                const results = calculateDaysInEU(updatedPeriods);
                setPeriods(updatedPeriods);
                setDaysInEU(results.daysInEU);
                setExpiryDate(results.expiryDate);
            } else {
                console.error('Failed to delete period:', data);
            }
        } catch (error) {
            console.error('Error deleting period:', error);
        }
    };

    return (
        <div className="App">
            <h1>EU Travel Tracker</h1>
            <div className="input-container">
                <label htmlFor="start-date">Day entered EU:</label>
                <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                />
            </div>
            <div className="input-container">
                <label htmlFor="end-date">Day left EU:</label>
                <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                />
            </div>
            <div className="button-container">
                <button onClick={addPeriod}>Add Period</button>
            </div>
            <ul>
                {periods.map((period, index) => (
                    <li key={index}>
                        From {period.start_date} to {period.end_date}
                        <button onClick={() => deletePeriod(period.start_date, period.end_date)}>Delete</button>
                    </li>
                ))}
            </ul>
            <div className="center-text">
                <h2 style={{ color: daysInEU > 180 ? 'red' : 'black' }}>
                    Days in EU in last 180 days: {daysInEU}
                </h2>
            </div>
            <div className="expiry-track">
                <h2>Oldest date expires on: {expiryDate}</h2>
            </div>
        </div>
    );
};

export default App;
