// your-signup-route.js

app.post('/api/signup', async (req, res) => {
  try {
    // 1. Validate and save the signup to your main database
    const newSignup = await db.users.create({
      email: req.body.email,
      signup_date: new Date().toISOString(),
      signup_source: req.body.signup_source,
      // ... other fields
    });

    // 2. Respond to the user quickly so they don't wait on external APIs
    res.status(201).json({ message: 'Signup successful!', userId: newSignup.id });

    // 3. Sync to HubSpot in the background (asynchronous)
    // Wrap in its own try/catch so a HubSpot failure doesn't crash your user's experience
    syncSignupToHubSpot(newSignup)
      .then(() => console.log(`Successfully synced ${newSignup.email} to HubSpot`))
      .catch(err => console.error(`Failed to sync to HubSpot in background:`, err));

  } catch (error) {
    console.error('Database signup failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
