app.use(express.json());

app.post("/api/event", (req, res) => {
  console.log("EXTENSION EVENT:", req.body);

  // এখানে তুমি save করতে পারো / dashboard পাঠাতে পারো
  res.sendStatus(200);
});