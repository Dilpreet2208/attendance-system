const express = require('express');
const Attendance = require('../models/Attendance');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const router = express.Router();

// Ensure the Excel_attendance folder exists
const folderPath = path.join(__dirname, '../Excel_attendance');
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}

// Define a function to create or load the Excel file
async function createOrLoadWorkbook(date) {
  const filePath = path.join(folderPath, `${date}_attendance.xlsx`);
  let workbook;
  let worksheet;

  if (fs.existsSync(filePath)) {
    // Load the existing workbook if the file exists
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    worksheet = workbook.getWorksheet('Attendance');
  } else {
    // Create a new workbook and worksheet if the file doesn't exist
    workbook = new ExcelJS.Workbook();
    worksheet = workbook.addWorksheet('Attendance');
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Username', key: 'username', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Login Time', key: 'loginTime', width: 20 },
      { header: 'Sign-Off Time', key: 'signOffTime', width: 20 },
    ];
  }

  return { workbook, worksheet, filePath };
}

// Mark attendance
router.post('/mark', async (req, res) => {
  try {
    const username = req.session.user.username;
    const name = req.session.user.name;

    if (!username || !name) {
      return res.status(401).send('User not logged in');
    }

    const now = new Date();
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const date = istDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = istDate.toTimeString().split(' ')[0]; // HH:MM:SS

    console.log(`Marking attendance for username: ${username} on date: ${date} at time: ${time}`);

    // Check if attendance is already marked for today in the database
    const existingRecord = await Attendance.findOne({ where: { username, date } });
    if (existingRecord) {
      return res.status(400).send('Attendance already marked for today');
    }

    // Save the attendance record to the database
    await Attendance.create({ name, username, date, loginTime: time });

    // Create or load the Excel file for today's attendance
    const { workbook, worksheet, filePath } = await createOrLoadWorkbook(date);

    // Debug: Print existing worksheet rows
    console.log('Existing rows in worksheet:');
    worksheet.eachRow((row, rowIndex) => {
      console.log(`Row ${rowIndex}: ${row.values}`);
    });

    // Append the new row directly
    const rowCount = worksheet.rowCount;
    const newRow = worksheet.getRow(rowCount + 1); // Get a new row
    newRow.values = [name, username, date, time, '']; // Assign values to the row
    newRow.commit(); // Commit the row changes to the worksheet

    // Save the updated workbook
    await workbook.xlsx.writeFile(filePath);
    console.log('Attendance saved to Excel file:', filePath);

    res.send('Attendance marked successfully');
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).send('Error marking attendance');
  }
});

// Sign off
router.post('/signoff', async (req, res) => {
  try {
    const username = req.session.user.username;
    if (!username) {
      return res.status(401).send('User not logged in');
    }

    const now = new Date();
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const date = istDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = istDate.toTimeString().split(' ')[0]; // HH:MM:SS

    // Find the attendance record for today
    const record = await Attendance.findOne({ where: { username, date } });
    if (!record) {
      return res.status(400).send('No attendance record found');
    }

    // Update the sign-off time in the database
    record.signOffTime = time;
    await record.save();

    // Create or load the Excel file for today's attendance
    const { workbook, worksheet, filePath } = await createOrLoadWorkbook(date);

    // Find the row corresponding to the username and date
    let row = null;
    worksheet.eachRow((r) => {
      if (r.getCell('B').value === username && r.getCell('C').value === date) {
        row = r; // Found the matching row
      }
    });

    if (!row) {
      return res.send('Mark attendance first');
    } else {
      // Update the existing row with the sign-off time
      row.getCell('E').value = time; // Column E corresponds to Sign-Off Time
      row.commit(); // Commit the changes to the row
    }

    // Save the updated workbook
    await workbook.xlsx.writeFile(filePath);
    console.log('Sign-off time saved to Excel file:', filePath);

    res.send('Sign off marked');
  } catch (error) {
    console.error('Error signing off attendance:', error);
    if (!res.headersSent) {
      res.status(500).send('Error signing off attendance');
    }
  }
});


module.exports = router;
