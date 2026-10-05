import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
export default function PlantDetails() {
  const { id } = useParams();
  const [p, setP] = useState();
  useEffect(() => {
    api.get(`/plants/${id}`).then((r) => setP(r.data));
  }, [id]);
  if (!p) return <div className="loading">Loading...</div>;
  return (
    <section className="section detail">
      <div className="detailImg">
        <img src={p.image} />
      </div>
      <div>
        <span className="eyebrow">{p.category}</span>
        <h1>{p.name}</h1>
        <p className="scientific">{p.scientificName}</p>
        <p>{p.description}</p>
        <div className="specGrid">
          <div>
            <b>☀ Sunlight</b>
            <span>{p.sunlightRequirement}</span>
          </div>
          <div>
            <b>💧 Water</b>
            <span>{p.waterRequirement}</span>
          </div>
          <div>
            <b>◌ Drainage</b>
            <span>{p.drainageRequirement}</span>
          </div>
          <div>
            <b>pH</b>
            <span>{p.phRange}</span>
          </div>
        </div>
        <div className="care">
          <b>Care</b>
          <p>{p.careInstructions}</p>
        </div>
        <Link className="btn primary" to={`/smart-mix?plant=${p._id}`}>
          Create mix for {p.name}
        </Link>
      </div>
    </section>
  );
}
