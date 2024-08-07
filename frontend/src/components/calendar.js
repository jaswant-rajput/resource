import React, { useEffect, useState } from 'react';
import './calendar.css';
import { getAllocationByMonth, removeAllocation, getDefaultAllocation } from '../actions/resourceAllocationActions';
import { getAllResources } from '../actions/resourceActions';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, IconButton, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import Alert from '@mui/material/Alert';
import { useRefresh } from './RefreshContext';
import { useAuthStore } from "../store/store";

const Calendar = ({ selectedResourceId }) => {

    const user = useAuthStore.getState().user;

    const [allocationData, setAllocationData] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedDateAllocations, setSelectedDateAllocations] = useState([]);
    const [selectedAllocation, setSelectedAllocation] = useState(null);
    const [startdate, setStartDate] = useState('');
    const [resourceType, setResourceType] = useState('');
    const [resourceNo, setResourceNo] = useState('');
    const [defaultAllocations, setDefaultAllocations] = useState([]);


    const { refresh, resetRefresh } = useRefresh();
    const { triggerRefresh } = useRefresh();

    const [alertMessage, setAlertMessage] = useState('');
    const [severity, setSeverity] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);

    const [month, setMonth] = useState(0); // Initial month
    const months = [
        { number: 0, name: 'January' },
        { number: 1, name: 'February' },
        { number: 2, name: 'March' },
        { number: 3, name: 'April' },
        { number: 4, name: 'May' },
        { number: 5, name: 'June' },
        { number: 6, name: 'July' },
        { number: 7, name: 'August' },
        { number: 8, name: 'September' },
        { number: 9, name: 'October' },
        { number: 10, name: 'November' },
        { number: 11, name: 'December' }
    ];

    useEffect(() => {
        if (selectedResourceId) {
            console.log("from calendar.js value is ", selectedResourceId);
            // handleGetAllocationByMonth(selectedResourceId);
            handleGetAllocationByMonth(selectedResourceId);
            handleResourceNames(selectedResourceId);
            handleGetDefault(selectedResourceId)
            setDefaultAllocations('')
        }
    }, [selectedResourceId]);

    const handleGetDefault = (resourceId) => {
        setDefaultAllocations([])
        getDefaultAllocation(resourceId)
            .then(response => {
                if (response.success && response.data && response.data.length > 0) {
                    setDefaultAllocations(response.data);
                    console.log('Default allocations:', response.data);
                } else {
                    console.log('No default allocation found');
                    setDefaultAllocations([]); // Ensure the state is cleared if no allocation is found
                }
            })
            .catch(err => {
                console.error('Error fetching default allocation:', err);
                setDefaultAllocations([]); // Ensure the state is cleared if no allocation is found
            });
    };


    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    const triggerAlert = (message, severity) => {
        setAlertMessage(message);
        setSeverity(severity);
        setAlertOpen(true);
    };

    const handleResourceNames = (resourceId) => {
        getAllResources()
            .then(response => {
                const matchedResource = response.data.find(resource => resource._id === resourceId);
                if (matchedResource) {
                    setResourceType(matchedResource.resourceType);
                    setResourceNo(matchedResource.resourceNo);
                } else {
                    console.log('Resource not found for resourceId:', resourceId);
                }
            })
            .catch(err => console.log('Error fetching resources:', err));
    }

    const handleGetAllocationByMonth = (resourceId) => {
        let nextmonth = month + 1;
        getAllocationByMonth(resourceId, '2024', nextmonth)
            .then((data) => {
                console.log('month from get Allocation ', nextmonth)
                if (data && data.data) {
                    // Sort the data by startdate
                    const sortedData = data.data.sort((a, b) => new Date(a.startdate) - new Date(b.startdate));
                    setAllocationData(sortedData); // Setting the sorted data array directly
                }
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        if (refresh) {
            console.log('Refreshing calendar...');
            resetRefresh();
            handleGetAllocationByMonth(selectedResourceId);
        }
    }, [refresh, resetRefresh, handleGetAllocationByMonth]);

    const handleSingleAllocation = (dateAllocations, startdate) => {
        setSelectedDateAllocations(dateAllocations);
        setStartDate(startdate);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedDateAllocations([]);
    };

    const handleDeleteAllocation = (allocation) => {
        // Find the matching entry in allocationData
        let outerId = null;
        const formattedStartDate = new Date(startdate);
        formattedStartDate.setDate(formattedStartDate.getDate() + 1);
        const nextDay = formattedStartDate.toISOString().split('T')[0];

        allocationData.forEach((data) => {
            const allocationStartDate = new Date(data.startdate).toISOString().split('T')[0];
            if (allocationStartDate === nextDay) {
                outerId = data._id;
                console.log(allocation.createdBy)
            }
        });
        console.log(user._id)
        if (!outerId) {
            console.error('No matching allocation data found for the selected date');
            triggerAlert('No matching allocation data found for the selected date', 'error');
           
            return;
        } else if (allocation.createdBy !== user._id) {
            console.error('This allocation was not created by you');
           
            triggerAlert('This allocation was not created by you', 'error');
            return;
        }

        console.log('Found outerId:', outerId);

        // Perform the deletion logic here (e.g., update the state or make an API call)
        const updatedAllocations = selectedDateAllocations.filter(item => item._id !== allocation._id);
        setSelectedDateAllocations(updatedAllocations);

        setAllocationData(allocationData.map(data => {
            if (data._id === outerId) {
                return {
                    ...data,
                    allocationRecords: data.allocationRecords.filter(record => record._id !== allocation._id)
                };
            }
            return data;
        }));

        // Format dates to 'YYYY-MM-DD 00:00:00.000Z'
        const formatToDate = (dateString) => {
            const date = new Date(dateString);
            date.setUTCHours(0, 0, 0, 0);
            return date.toISOString().replace('T', ' ').replace('.000Z', ':00.000Z');
        };

        const deleteData = {
            resourceObjectId: selectedResourceId,
            dates: [formatToDate(nextDay)],
            time: allocation.time
        };

        console.log('deletion data', deleteData);

        removeAllocation(JSON.stringify(deleteData))
            .then(response => {
                console.log('Response for delete:', response);
                triggerRefresh();
                triggerAlert('Successfully deleted allocation', 'success');
            })
            .catch(err => {
                console.log('Error from delete:', err);
                triggerAlert('Failed to delete allocation', 'error');
            });

        setSelectedAllocation(null);
        setOpen(updatedAllocations.length > 0);
    };



    const handleMonthChange = (event) => {
        const selectedMonth = event.target.value;
        setMonth(selectedMonth);
        console.log('month number', selectedMonth);
        handleGetAllocationByMonth1(selectedResourceId, selectedMonth)
        //handleGetAllocationByMonth(selectedResourceId)
        // Perform any other actions you need when the month changes here
    };

    const handleGetAllocationByMonth1 = (resourceId, month) => {
        let nextmonth = month + 1
        getAllocationByMonth(resourceId, '2024', nextmonth)
            .then((data) => {
                console.log('month from get Allocation ', nextmonth)
                if (data && data.data) {
                    // Sort the data by startdate
                    const sortedData = data.data.sort((a, b) => new Date(a.startdate) - new Date(b.startdate));
                    setAllocationData(sortedData); // Setting the sorted data array directly
                }
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    };




    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const year = 2024;
    //const month = 4; // May (month is zero-indexed in JavaScript Date object)

    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    return (
        <div>
            {/* <p>Default Allocation is {defaultclass} {time}</p> */}
            {/* <p>Selected Resource Id is : {selectedResourceId}</p> */}
            <div className='border border-primary p-2'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxHeight: '9vh',maxWidth: '340vw' }}>
                    {/* <h6 className='text-start' style={{ marginBottom: 0 }}>
                        Default Allocation is {defaultclass} {time}
                    </h6> */}
                    <div style={{maxHeight:'10vh',overflowY: 'scroll',scrollbarWidth:'none'}}>
                        {defaultAllocations.length > 0 ? (
                            defaultAllocations.map((allocation, index) => (
                                <div key={index} style={{
                                    maxHeight: '100%', // Use full height of the parent
                                }}>
                                    <p>
                                        <b>Class:</b> {allocation.class} &nbsp;
                                        <b>Time:</b> {allocation.time}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No default allocations found</p>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h6 className='text-center' style={{ marginBottom: 0 }}>
                            Selected Resource is {resourceType} : {resourceNo}
                        </h6>
                        <Select value={month} onChange={handleMonthChange} style={{ marginLeft: '2vw' }}>
                            {months.map((month, index) => (
                                <MenuItem key={index} value={month.number}>{month.name}</MenuItem>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>
            <div className='days-of-week'>
                {daysOfWeek.map((day, index) => (
                    <div key={index} className='day-cell'>
                        {day}
                    </div>
                ))}
            </div>
            <div className='col-10'>
                <div className='grid-container'>
                    {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                        <div key={index} className='grid-cell empty-cell'></div>
                    ))}
                    {Array.from({ length: totalDaysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const currentDate = new Date(year, month, day);
                        const allocationsForTheDay = allocationData.find(data => new Date(data.startdate).getDate() === day);
                        const dateAllocations = allocationsForTheDay ? allocationsForTheDay.allocationRecords : [];

                        return (
                            <div key={index} className='grid-cell border border-secondary' onClick={() => handleSingleAllocation(dateAllocations, currentDate.toISOString().split('T')[0])}
                             style={{ overflowY: "scroll",overflowX:'scroll', scrollbarWidth: "none" }}>
                                <h5 style={{ textAlign: "center" }}>{day}</h5>
                                <div>
                                    {dateAllocations.map((record, recordIndex) => (
                                        <div
                                            key={recordIndex}
                                            className={`border rounded px-1 ${recordIndex % 2 === 0 ? 'border-primary' : 'border-secondary'}`}
                                            style={{
                                                marginBottom: "0.5vh",
                                                position: "relative",
                                                marginRight: "0.5vh",
                                                marginLeft: "0.5vh",
                                                backgroundColor: recordIndex % 2 === 0 ? '#f0f8ff' : '#ffe4e1', // Light blue for even, light pink for odd
                                            }}
                                        >
                                            <div style={{ fontSize: '0.81vw' }}>
                                                <p> {record.class} {/*{record.time}*/}</p>
                                                {/* <h6>{record.class}</h6>*/}
                                                {/* {index} */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    Allocation Details
                </DialogTitle>
                <DialogContent>
                    {selectedDateAllocations.map((allocation, index) => (
                        <div key={index} className='border border-primary rounded' style={{ marginBottom: "1vh", position: "relative", padding: "2vw" }}>
                            <IconButton
                                aria-label="delete"
                                onClick={() => handleDeleteAllocation(allocation)}
                                style={{ position: 'absolute', right: -6, top: -3 }}
                            >
                                <DeleteIcon style={{ color: 'blue' }} />
                            </IconButton>
                            <DialogContentText>
                                <strong>Description:</strong> {allocation.description}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>Class:</strong> {allocation.class}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>Time:</strong> {allocation.time}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>Department:</strong> {allocation.department}
                            </DialogContentText>
                        </div>

                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={alertOpen} onClose={handleAlertClose}>
                <Alert severity={severity} onClose={handleAlertClose}>
                    {alertMessage}
                </Alert>
            </Dialog>
        </div>
    );
};

export default Calendar;