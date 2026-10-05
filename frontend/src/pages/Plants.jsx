import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
export default function Plants() {
  const [p, setP] = useState([]);
  useEffect(() => {
    api.get("/plants").then((r) => setP(r.data));
  }, []);
  return (
    <section className="section">
      <div className="pageTitle">
        <span className="eyebrow">PLANT LIBRARY</span>
        <h1>Find your plant.</h1>
        <p>
          Explore requirements and build a personalized mix from a plant
          profile.
        </p>
      </div>
      <div className="plantGrid">
        {p.map((x) => (
          <Link className="plantCard" to={`/plants/${x._id}`} key={x._id}>
            <img src={x.image} />
            <div>
              <span>{x.category}</span>
              <h3>{x.name}</h3>
              <p>{x.scientificName}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
