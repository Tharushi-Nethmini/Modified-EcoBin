import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ProgressBar from './ProgressBar';
import '../styles/ScheduleCollection.css';
import moment from 'moment-timezone';
import Header from './../Header';
import Footer from './../Footer';

const ScheduleCollection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Only log in development (prevents Information Disclosure in production)
  if (process.env.NODE_ENV === 'development') {
    console.debug('Location State:', location.state);
  }

  const {
    items,
    totalWeight = 0,
    totalPrice = 0,
    paymentMethod = 'Cash',
    userName = '',
    userEmail = '',
  } = location.state || {};

  const serviceFee = 20.0;
  const toReceive = (totalPrice - serviceFee).toFixed(2);

  // Local state for Address, District, and Date-Time
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ✅ Simple sanitize for alert messages (mitigates basic XSS in alerts)
  const safeAlert = (msg) => {
    const clean = String(msg).replace(/[<>&'"]/g, '');
    alert(clean);
  };

  // Helper function to format the date and time without conversion
  const formatDateTime = (date) => {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  };

  // ✅ Prevent past date/time selection (mitigates Insecure Design: Backdating)
  const handleDateChange = (date) => {
    const now = new Date();
    if (date < now) {
      safeAlert('Please choose a future date/time.');
      return;
    }
    setSelectedDate(date);
  };

  // Handle form submission
  const handleConfirm = async () => {
    if (!items || totalPrice === undefined || totalWeight === undefined) {
      console.error('Required data is missing');
      safeAlert('Something went wrong. Please go back and try again.');
      return;
    }

    const collectionData = {
      userName: userName || 'siyani',
      userEmail,
      items: Object.entries(items)
        .filter(([, itemData]) => itemData.selected)
        .map(([itemName, itemData]) => ({
          itemName,
          weight: itemData.weight.toFixed(1),
          total: itemData.total.toFixed(2),
        })),
      totalWeight: totalWeight.toFixed(1),
      totalPrice: totalPrice.toFixed(2),
      paymentType: paymentMethod,
      toReceive: Math.max(totalPrice - serviceFee, 0).toFixed(2),
      address,
      district,
      dateTime: formatDateTime(selectedDate),
    };

    try {
      const response = await fetch('http://localhost:8070/api/recycle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectionData),
      });

      if (response.ok) {
        navigate('/success', {
          state: { toReceive, paymentMethod },
        });
      } else {
        safeAlert('Failed to schedule collection. Please try again.');
      }
    } catch (error) {
      console.error('Error scheduling collection:', error);
      safeAlert('An error occurred while scheduling the collection.');
    }
  };

  return (
    <>
      <Header />
      <div>
        <ProgressBar activeStep={3} />

        <div className="schedule-container1">
          <h3>Schedule a collections slot</h3>

          <div className="schedule-form2">
            <label>
              <span>Address:</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
              />
            </label>

            <label>
              <span>District:</span>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">Select District</option>
                <option value="Colombo">Colombo</option>
                <option value="Gampaha">Gampaha</option>
                <option value="Kalutara">Kalutara</option>
                <option value="Kandy">Kandy</option>
                <option value="Matale">Matale</option>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
                <option value="Galle">Galle</option>
                <option value="Matara">Matara</option>
                <option value="Hambantota">Hambantota</option>
                <option value="Jaffna">Jaffna</option>
                <option value="Kilinochchi">Kilinochchi</option>
                <option value="Mannar">Mannar</option>
                <option value="Vavuniya">Vavuniya</option>
                <option value="Mullaitivu">Mullaitivu</option>
                <option value="Trincomalee">Trincomalee</option>
                <option value="Batticaloa">Batticaloa</option>
                <option value="Ampara">Ampara</option>
                <option value="Kurunegala">Kurunegala</option>
                <option value="Puttalam">Puttalam</option>
                <option value="Anuradhapura">Anuradhapura</option>
                <option value="Polonnaruwa">Polonnaruwa</option>
                <option value="Badulla">Badulla</option>
                <option value="Monaragala">Monaragala</option>
                <option value="Ratnapura">Ratnapura</option>
                <option value="Kegalle">Kegalle</option>
              </select>
            </label>

            <label>
              <span>Date & Time:</span>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                showTimeSelect
                minDate={new Date()} // ✅ Prevents past dates
                dateFormat="Pp"
                className="date-picker"
              />
            </label>

            <button className="confirm-button" onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ScheduleCollection;
