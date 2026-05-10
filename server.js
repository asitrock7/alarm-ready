const express = require('express');
const webpush = require('web-push');
const schedule = require('node-schedule');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Generate these using: npx web-push generate-vapid-keys
const vapidKeys = {
    public: 'YOUR_PUBLIC_KEY',
    private: 'YOUR_PRIVATE_KEY'
};

webpush.setVapidDetails('mailto:admin@yourdomain.com', vapidKeys.public, vapidKeys.private);

app.post('/schedule', (req, res) => {
    const { task, time, subscription } = req.body;
    
    // Trigger alarm exactly 4 minutes before task time
    const alarmTime = new Date(new Date(time).getTime() - (4 * 60000));

    schedule.scheduleJob(alarmTime, () => {
        webpush.sendNotification(subscription, JSON.stringify({
            title: "Task Reminder",
            body: `"${task}" starts in 4 minutes!`
        })).catch(err => console.error("Push Error:", err));
    });

    res.status(200).send({ status: 'Alarm Scheduled' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
