import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { getAllResources, createResource } from '../actions/resourceActions';
import { addAllocation, setDefaultAllocation } from '../actions/resourceAllocationActions';
import { useEffect, useState } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
// const { ObjectId } = require('mongoose').Types;
//import { ObjectId } from 'bson';
import { useRefresh } from './RefreshContext';



const Navbar = ({ onResourceSelect }) => {
  const [open, setOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [allocationOpen, setAllocationOpen] = useState(false);
  const [defaultAllocationOpen, setDefaultAllocationOpen] = useState(false);

  const [resources, setResources] = useState([]);
  const [resourceType, setResourceType] = useState('');
  const [resourceNo, setResourceNo] = useState('');
  const [resourceId, setResourceId] = useState('');



  const [alertMessage, setAlertMessage] = useState('');
  const [severity, setSeverity] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);


  const [singleDayOpen, setSingleDayOpen] = useState(false);
  const [date, setDate] = useState('');
  const [classInput, setClassInput] = useState('');
  const [description, setDescription] = useState('');
  const [starttime, setStartTime] = useState('');
  const [endtime, setEndTime] = useState('');

  const [multipleDayOpen, setMultipleDayOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isWeekDayChecked, setIsWeekDayChecked] = useState(false);

  const { triggerRefresh } = useRefresh();







  const fetchData = async () => {
    try {
      const response = await getAllResources();
      console.log('data from getAllResources', response);

      if (response && response.data) {
        const transformedData = response.data.map(resource => ({
          label: `${resource.resourceType} - ${resource.resourceNo}`,
          resourceNo: resource.resourceNo,
          resourceType: resource.resourceType,
          _id: resource._id,
        }
        ));
        setResources(transformedData); // Make sure this updates the state correctly
      } else {
        console.error('Invalid data format:', response);
      }
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('Updated Resource Type:', resourceType);
    console.log('Updated Resource No:', resourceNo);
  }, [resourceType, resourceNo]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleResourceOpen = () => {
    setResourceOpen(true);
    setOpen(false); // Close the first modal
  };

  const handleResourceClose = () => {
    setResourceOpen(false);
  };

  const handleAllocationOpen = () => {
    setAllocationOpen(true);
    setOpen(false); // Close the first modal
  };

  const handleAllocationClose = () => {
    setAllocationOpen(false);
  };

  const handleSingleDayOpen = () => {
    setSingleDayOpen(true);
    //setAllocationOpen(false);
  };

  const handleSingleDayClose = () => {
    setSingleDayOpen(false);
    setClassInput('')
    setDescription('')
    setDate('')
  };

  const handleMultipleDayOpen = () => {
    setMultipleDayOpen(true);
    setAllocationOpen(false);
  };

  const handleMultipleDayClose = () => {
    setMultipleDayOpen(false);
  };

  const handleDefaultAllocationOpen = () => {
    setDefaultAllocationOpen(true);
    setAllocationOpen(false);
  };

  const handleDefaultAllocationClose = () => {
    setDefaultAllocationOpen(false);
  };

  const handleResourceTypeChange = (event) => {
    setResourceType(event.target.value);
    console.log('resourceType', resourceType);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const triggerAlert = (message, severity) => {
    setAlertMessage(message);
    setSeverity(severity);
    setAlertOpen(true);
  };


  const handleCombinedChange = (resource) => {
    if (resource) {
      logSelectedResourceId(resource);
      handleResourceSelection(resource);
    }
  }

  const logSelectedResourceId = (resource) => {
    if (resource) {
      console.log('resource', resource)
      onResourceSelect(resource._id);
      setResourceId(resource._id);
      console.log('Selected Resource ID:', resource._id);
      console.log('Selected Resource label:', resource.label);
      console.log('Selected Resource Type:', resource.resourceType);
      console.log('Selected Resource No:', resource.resourceNo);
    } else {
      console.log('No resource selected');
    }
  };

  const handleResourceSelection = (resource) => {
    if (resource) {
      setResourceType(resource.resourceType);
      setResourceNo(resource.resourceNo);

    }
  }


  const handleResourceCreateSave = async () => {
    console.log('Checking if resource exists:', { resourceNo, resourceType });

    await fetchData(); // Ensure we have the latest data

    const resourceExists = resources.some(
      resource => resource.resourceNo.toString() === resourceNo.toString() && resource.resourceType === resourceType
    );
    console.log('resourceExists is', resourceExists, 'and its type is', typeof resourceExists);

    if (resourceExists) {
      console.log('Resource combination exists:', { resourceNo, resourceType });
      triggerAlert('This resource combination already exists.', 'error');
      return;
    }

    try {
      const data = await createResource({ resourceNo, resourceType });
      console.log('Successful resource creation', data);
      triggerAlert('Successfully Created Resource', 'success')
      fetchData();
      handleResourceClose();
    } catch (err) {
      console.log('Error in creating resource', err);
      triggerAlert('Failed to create resource.');
    }

    setResourceType('');
    setResourceNo('');
  };

  dayjs.extend(localizedFormat);


  const handleSingleDayAllocation = () => {
    // Ensure starttime and endtime are dayjs instances
    const start = dayjs(starttime);
    const end = dayjs(endtime);

    if (!start.isValid() || !end.isValid()) {
      console.error('Invalid start time or end time');
      triggerAlert('Invalid start time or end time', 'error');
      return;
    }

    const formattedStartTime = start.format('h:mm A');
    const formattedEndTime = end.format('h:mm A');
    const tempformattedTime = `${formattedStartTime} - ${formattedEndTime}`;

    // Convert date string to a Date object
    const parsedDate = new Date(date);

    console.log('Date value:', parsedDate);
    console.log('Date type:', typeof parsedDate);
    console.log('Is date instance of Date:', parsedDate instanceof Date);
    console.log('Is date NaN:', isNaN(parsedDate));

    if (!(parsedDate instanceof Date) || isNaN(parsedDate)) {
      console.error('Invalid date value');
      triggerAlert('Invalid Date Value', 'error');
      return;
    }

    // Format the date to ISO string with timezone offset set to zero (UTC)
    const formattedDate = parsedDate.toISOString();
    console.log('Formatted Date:', formattedDate);

    const allocationData = {
      resourceObjectId: resourceId,
      dates: [formattedDate],
      allocation: {
        class: classInput,
        description: description,
        time: tempformattedTime
      }
    };

    if (resourceId && formattedDate && classInput && description && tempformattedTime) {
      addAllocation(JSON.stringify(allocationData))
        .then(response => {
          triggerRefresh();
          console.log('Response from add allocation', response);
          triggerAlert('Successfully Created Allocation', 'success');
          handleSingleDayClose();
        })
        .catch(err => {
          console.error('Failed to add allocation:', err);
          triggerAlert('Failed to create Allocation', 'error');
        });
    } else {
      triggerAlert('Fill in All the fields', 'error');
    }

    handleSingleDayClose();
  };


  // const handleSingleDayAllocation = async () => {
  //   // Ensure starttime and endtime are dayjs instances
  //   const start = dayjs(starttime);
  //   const end = dayjs(endtime);

  //   if (!start.isValid() || !end.isValid()) {
  //     console.error('Invalid start time or end time');
  //     triggerAlert('Invalid start time or end time', 'error');
  //     return;
  //   }

  //   const formattedStartTime = start.format('h:mm A');
  //   const formattedEndTime = end.format('h:mm A');
  //   const tempformattedTime = `${formattedStartTime} - ${formattedEndTime}`;

  //   // Convert date string to a Date object
  //   const parsedDate = new Date(date);

  //   console.log('Date value:', parsedDate);
  //   console.log('Date type:', typeof parsedDate);
  //   console.log('Is date instance of Date:', parsedDate instanceof Date);
  //   console.log('Is date NaN:', isNaN(parsedDate));

  //   if (!(parsedDate instanceof Date) || isNaN(parsedDate)) {
  //     console.error('Invalid date value');
  //     triggerAlert('Invalid Date Value', 'error');
  //     return;
  //   }

  //   // Format the date to ISO string with timezone offset set to zero (UTC)
  //   const formattedDate = parsedDate.toISOString();
  //   console.log('Formatted Date:', formattedDate);

  //   // Extract year and month for getAllocationByMonth
  //   const year = parsedDate.getFullYear();
  //   const month = parsedDate.getMonth() + 1; // getMonth() is zero-based

  //   // Fetch existing allocations for the month and resource
  //   try {
  //     const existingAllocations = await getAllocationByMonth(resourceId, year, month);
  //     console.log('Existing allocations:', existingAllocations);

  //     if (Array.isArray(existingAllocations)) {
  //       // Check if there is any allocation for the selected date and time range
  //       const allocationExists = existingAllocations.some(allocation => {
  //         const allocationDate = new Date(allocation.dates[0]).toISOString().split('T')[0];
  //         const selectedDate = formattedDate.split('T')[0];

  //         if (allocationDate === selectedDate) {
  //           const allocationStart = dayjs(allocation.allocation.time.split(' - ')[0], 'h:mm A');
  //           const allocationEnd = dayjs(allocation.allocation.time.split(' - ')[1], 'h:mm A');

  //           // Check for time overlap
  //           return (start.isBefore(allocationEnd) && end.isAfter(allocationStart));
  //         }
  //         return false;
  //       });

  //       if (allocationExists) {
  //         triggerAlert('Allocation already exists for the selected date and time', 'error');
  //         return;
  //       }
  //     } else {
  //       console.error('Invalid response format from getAllocationByMonth');
  //       triggerAlert('Invalid response format from server', 'error');
  //       return;
  //     }
  //   } catch (error) {
  //     console.error('Error fetching existing allocations:', error);
  //     triggerAlert('Error fetching existing allocations', 'error');
  //     return;
  //   }

  //   const allocationData = {
  //     resourceObjectId: resourceId,
  //     dates: [formattedDate],
  //     allocation: {
  //       class: classInput,
  //       description: description,
  //       time: tempformattedTime
  //     }
  //   };

  //   if (resourceId && formattedDate && classInput && description && tempformattedTime) {
  //     addAllocation(allocationData)
  //       .then(response => {
  //         triggerRefresh();
  //         console.log('Response from add allocation', response);
  //         triggerAlert('Successfully Created Allocation', 'success');
  //       })
  //       .catch(err => {
  //         console.error('Failed to add allocation:', err);
  //         triggerAlert('Failed to create Allocation', 'error');
  //       });
  //   } else {
  //     triggerAlert('Fill in All the fields', 'error');
  //   }

  //   handleSingleDayClose();
  // };


  // const handleMultipleDaySave = () => {
  //   // Ensure starttime and endtime are dayjs instances
  //   const start = dayjs(starttime);
  //   const end = dayjs(endtime);

  //   if (!start.isValid() || !end.isValid()) {
  //     console.error('Invalid start time or end time');
  //     triggerAlert('Invalid start time or end time', 'error');
  //     return;
  //   }

  //   const formattedStartTime = start.format('h:mm A');
  //   const formattedEndTime = end.format('h:mm A');
  //   const tempformattedTime = `${formattedStartTime} - ${formattedEndTime}`;

  //   // Convert start and end dates to Date objects
  //   const parsedStartDate = new Date(startDate);
  //   const parsedEndDate = new Date(endDate);

  //   console.log('Start Date value:', parsedStartDate);
  //   console.log('End Date value:', parsedEndDate);

  //   if (!(parsedStartDate instanceof Date) || isNaN(parsedStartDate) ||
  //     !(parsedEndDate instanceof Date) || isNaN(parsedEndDate)) {
  //     console.error('Invalid start or end date value');
  //     triggerAlert('Invalid start or end date value', 'error');
  //     return;
  //   }

  //   // Format the start and end dates to ISO strings
  //   const formattedStartDate = parsedStartDate.toISOString();
  //   const formattedEndDate = parsedEndDate.toISOString();

  //   console.log('Formatted Start Date:', formattedStartDate);
  //   console.log('Formatted End Date:', formattedEndDate);

  //   // Generate an array of dates from start to end date
  //   const datesArray = [];
  //   let currentDate = parsedStartDate;

  //   while (currentDate <= parsedEndDate) {
  //     datesArray.push(new Date(currentDate).toISOString());
  //     currentDate.setDate(currentDate.getDate() + 1);
  //   }

  //   console.log('Generated Dates Array:', datesArray);

  //   // Log formatted data
  //   const allocationData = {
  //     resourceObjectId: resourceId,
  //     dates: datesArray,
  //     allocation: {
  //       class: classInput,
  //       description: description,
  //       time: tempformattedTime
  //     }
  //   };

  //   console.log('Formatted Allocation Data:', allocationData);

  //   // Rest of the save logic can go here, if needed
  //   if (resourceId && datesArray && classInput && description && tempformattedTime) {
  //     addAllocation(JSON.stringify(allocationData))
  //       .then(response => {
  //         triggerRefresh();
  //         console.log('Response from add allocation', response);
  //         triggerAlert('Successfully Created Allocation', 'success');
  //         handleSingleDayClose();
  //       })
  //       .catch(err => {
  //         console.error('Failed to add allocation:', err);
  //         triggerAlert('Failed to create Allocation', 'error');
  //       });
  //   } else {
  //     triggerAlert('Fill in All the fields', 'error');
  //   }
  // };



  const handleMultipleDaySave = () => {
    // Ensure starttime and endtime are dayjs instances
    const start = dayjs(starttime);
    const end = dayjs(endtime);

    if (!start.isValid() || !end.isValid()) {
      console.error('Invalid start time or end time');
      triggerAlert('Invalid start time or end time', 'error');
      return;
    }

    const formattedStartTime = start.format('h:mm A');
    const formattedEndTime = end.format('h:mm A');
    const tempformattedTime = `${formattedStartTime} - ${formattedEndTime}`;

    // Convert start and end dates to Date objects
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    console.log('Start Date value:', parsedStartDate);
    console.log('End Date value:', parsedEndDate);

    if (!(parsedStartDate instanceof Date) || isNaN(parsedStartDate) ||
      !(parsedEndDate instanceof Date) || isNaN(parsedEndDate)) {
      console.error('Invalid start or end date value');
      triggerAlert('Invalid start or end date value', 'error');
      return;
    }

    // Format the start and end dates to ISO strings
    const formattedStartDate = parsedStartDate.toISOString();
    const formattedEndDate = parsedEndDate.toISOString();

    console.log('Formatted Start Date:', formattedStartDate);
    console.log('Formatted End Date:', formattedEndDate);

    // Generate an array of dates from start to end date
    const datesArray = [];
    let currentDate = parsedStartDate;

    if (isWeekDayChecked) { // Check if the checkbox is checked
      while (currentDate <= parsedEndDate) {
        datesArray.push(new Date(currentDate).toISOString());
        currentDate.setDate(currentDate.getDate() + 7); // Increment by 7 days
      }
    } else {
      while (currentDate <= parsedEndDate) {
        datesArray.push(new Date(currentDate).toISOString());
        currentDate.setDate(currentDate.getDate() + 1); // Increment by 1 day
      }
    }

    console.log('Generated Dates Array:', datesArray);

    // Log formatted data
    const allocationData = {
      resourceObjectId: resourceId,
      dates: datesArray,
      allocation: {
        class: classInput,
        description: description,
        time: tempformattedTime
      }
    };

    console.log('Formatted Allocation Data:', allocationData);

    // Rest of the save logic can go here, if needed
    if (resourceId && datesArray && classInput && description && tempformattedTime) {
      addAllocation(JSON.stringify(allocationData))
        .then(response => {
          triggerRefresh();
          console.log('Response from add allocation', response);
          triggerAlert('Successfully Created Allocation', 'success');
          handleSingleDayClose();
        })
        .catch(err => {
          console.error('Failed to add allocation:', err);
          triggerAlert('Failed to create Allocation', 'error');
        });
    } else {
      triggerAlert('Fill in All the fields', 'error');
    }
};



  const handleDefaultAllocationSave = () => {
    const start = dayjs(starttime);
    const end = dayjs(endtime);

    if (!start.isValid() || !end.isValid()) {
      console.error('Invalid start time or end time');
      triggerAlert('Invalid start time or end time', 'error');
      return;
    }

    const formattedStartTime = start.format('h:mm A');
    const formattedEndTime = end.format('h:mm A');
    const tempformattedTime = `${formattedStartTime} - ${formattedEndTime}`;

    console.log('time', tempformattedTime);

    const allocationData = {
      class: classInput,
      time: tempformattedTime
    };

    setDefaultAllocation(resourceId, JSON.stringify(allocationData))
      .then(response => {
        console.log('Response from set default allocation:', response);
        triggerAlert('Successfully set default allocation', 'success');
      })
      .catch(err => {
        console.error('Failed to set default allocation:', err);
        triggerAlert('Failed to set default allocation', 'error');
      });

  }








  return (
    <div style={{ width: '16vw', marginRight: '1.7vw' }}>
      <div>
        <button type="button" className="btn btn-primary rounded-pill" style={{ width: '16vw', marginBottom: '1.2vw', marginTop: '0.8vw', marginRight: '0.1vw' }} onClick={handleOpen}>
          Create
        </button>
      </div>

      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={resources}
        getOptionLabel={(option) => `${option.resourceType} - ${option.resourceNo}`}
        sx={{ marginRight: '0.5vw', marginLeft: '0.5vw' }}
        renderInput={(params) => <TextField {...params} label="Resources" />}
        onChange={(event, value) => handleCombinedChange(value)}
      />

      <div style={{ width: '16vw', marginRight: "1.7vw", height: '61vh', marginTop: '2.1vh', overflowY: 'scroll', scrollbarWidth: 'none' }} className='border border-secondary'>
        {resources.map((resource, index) => (
          <div key={resource._id} >
            <div className='border border-primary p-1 m-2' onClick={() => handleCombinedChange(resource)}>
              <h6>{resource.resourceType} : {resource.resourceNo}</h6>
            </div>
          </div>
        ))}
      </div>


      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select an Option</DialogTitle>
        <DialogContent>
          <ul>
            <li>
              <Button onClick={handleResourceOpen}>Resource</Button>
            </li>
            <br />
            <li>
              <Button onClick={handleAllocationOpen}>Event</Button>
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resourceOpen} onClose={handleResourceClose}>
        <DialogTitle>Resource Modal</DialogTitle>
        <DialogContent>
          <Select value={resourceType} onChange={handleResourceTypeChange} displayEmpty fullWidth>
            <MenuItem value="" disabled>
              Resource Type
            </MenuItem>
            <MenuItem value="classroom">Classroom</MenuItem>
            <MenuItem value="lab">Lab</MenuItem>
            <MenuItem value="seminar hall">Seminar Hall</MenuItem>
          </Select>
          <br />
          <TextField
            margin="dense"
            label="Resource Number"
            type="text"
            fullWidth
            variant="outlined"
            onChange={(e) => setResourceNo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResourceCreateSave}>Save</Button>
          <Button onClick={handleResourceClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={allocationOpen} onClose={handleAllocationClose}>
        <DialogTitle>Allocation Modal</DialogTitle>
        <DialogContent>
          <ul>
            <li>
              <Button onClick={handleSingleDayOpen}>Single Day Event</Button>
            </li>
            <br></br>
            <li>
              <Button onClick={handleMultipleDayOpen}>Multiple Day Event</Button>
            </li>
            <br></br>
            <li>
              <Button onClick={handleDefaultAllocationOpen}>Set Default Event</Button>
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAllocationClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={singleDayOpen} onClose={handleSingleDayClose}>
        <DialogTitle>Single Day Event</DialogTitle>
        <DialogContent>
          <p>Allocation is being added to {resourceType} : {resourceNo}</p>
          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <TextField
              label="Class"
              value={classInput}
              onChange={(e) => setClassInput(e.target.value)}
              fullWidth
              margin="normal"
            />
          </div>
          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
          </div>

          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['TimePicker']}>
                <TimePicker
                  label="From Time"
                  fullWidth
                  onChange={(newTime) => setStartTime(newTime)}
                  margin="normal"
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['TimePicker']}>
                <TimePicker
                  label="To Time"
                  fullWidth
                  margin="normal"
                  onChange={(newTime) => setEndTime(newTime)}
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>


        </DialogContent>
        <DialogActions>
          <Button onClick={handleSingleDayAllocation} color="primary">
            Save
          </Button>
          <Button onClick={handleSingleDayClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={multipleDayOpen} onClose={handleMultipleDayClose}>
        <DialogTitle>Multiple Day Event</DialogTitle>
        <DialogContent>
          <p>Allocation is being added to {resourceType} : {resourceNo}</p>
          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </div>


          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isWeekDayChecked}
                  onChange={(e) => setIsWeekDayChecked(e.target.checked)}
                />
              }
              label="WeekDay check"
            />
          </FormGroup>

          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <TextField
              label="Class"
              value={classInput}
              onChange={(e) => setClassInput(e.target.value)}
              fullWidth
              margin="normal"
            />
          </div>
          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
          </div>

          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['TimePicker']}>
                <TimePicker
                  label="Start Time"
                  onChange={(newTime) => setStartTime(newTime)}
                  fullWidth
                  margin="normal"
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['TimePicker']}>
                <TimePicker
                  label="End Time"
                  onChange={(newTime) => setEndTime(newTime)}
                  fullWidth
                  margin="normal"
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMultipleDaySave}>Save</Button>
          <Button onClick={handleMultipleDayClose}>Close</Button>
        </DialogActions>
      </Dialog>


      <Dialog open={defaultAllocationOpen} onClose={handleDefaultAllocationClose}>
        <DialogTitle>Set Default Event</DialogTitle>
        <DialogContent>
          {/* Add your default allocation components here */}

          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <TextField
              label="Class"
              value={classInput}
              onChange={(e) => setClassInput(e.target.value)}
              fullWidth
              margin="normal"
            />
          </div>

          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['TimePicker']}>
                <TimePicker
                  label="Start Time"
                  onChange={(newTime) => setStartTime(newTime)}
                  fullWidth
                  margin="normal"
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
          <div style={{ marginBottom: "1.2vh", width: "40vw" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['TimePicker']}>
                <TimePicker
                  label="End Time"
                  onChange={(newTime) => setEndTime(newTime)}
                  fullWidth
                  margin="normal"
                />
              </DemoContainer>
            </LocalizationProvider>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDefaultAllocationSave}>Save</Button>
          <Button onClick={handleDefaultAllocationClose}>Close</Button>
        </DialogActions>
      </Dialog>



      {/*alert */}
      <Dialog open={alertOpen} onClose={handleAlertClose}>
        <Alert severity={severity} onClose={handleAlertClose}>
          {alertMessage}
        </Alert>
      </Dialog>
    </div>
  );

}


export default Navbar