import { useState, useEffect } from "react";
import axios from "axios";
function App() {
  const [values, setValues] = useState();
  const [index, setIndex] = useState();
  const [newIndex, setNewIndex] = useState(0);
  useEffect(() => {
    async function fetchData() {
      const values = await axios.get("/api/values/current");
      setValues(values);
    }
    fetchData();
  }, []);
  useEffect(() => {
    async function fetchData() {
      const values = await axios.get("/api/values/all");
      setIndex(values);
    }
    fetchData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await axios.post("/api/values", { index: newIndex });
    setNewIndex(0);
  }
  console.log(values, index);
  return (
    <>
      <br></br>
      <form onSubmit={handleSubmit}>
        new index:
        <input
          type="number"
          value={newIndex}
          onChange={(e) => setNewIndex(parseInt(e.target.value))}
        ></input>
        <br />
        <button type="submit">submit</button>
      </form>
    </>
  );
}

export default App;
