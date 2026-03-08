const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
const sendPushNotification = require('./utils/sendPushNotification');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://agravatsahil07_db_user:07012003@aquabuddy.ydnecmu.mongodb.net/?appName=aquabuddy');
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'astest@gmail.com' });
        console.log('User found:', user._id);

        await sendPushNotification(user, '💧 Hydration Reminder', "Don't forget to drink water! Stay hydrated.", 'reminder');
        console.log('Notification sent seemingly successfully');
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        mongoose.disconnect();
    }
}
test();
