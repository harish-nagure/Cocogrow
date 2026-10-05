import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Leaf, ShoppingCart } from "lucide-react";
import { api } from "../api";
import { useApp } from "../context/AppContext";

const ENVIRONMENTS = [
  { name: "Indoor", icon: "🏠" },
  { name: "Outdoor", icon: "🌿" },
  { name: "Balcony", icon: "🪴" },
  { name: "Terrace/Garden", icon: "🌳" },
];

export default function SmartMix() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();

  const [plants, setPlants] = useState([]);
  const [step, setStep] = useState(1);
  const [env, setEnv] = useState("Indoor");
  const [category, setCategory] = useState("");
  const [plantId, setPlantId] = useState(params.get("plant") || "");
  const [quantity, setQuantity] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPlants() {
      try {
        setPlantsLoading(true);
        const response = await api.get("/mix/plants");

        if (!cancelled) {
          setPlants(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          alert(error.response?.data?.message || "Unable to load plants.");
        }
      } finally {
        if (!cancelled) {
          setPlantsLoading(false);
        }
      }
    }

    loadPlants();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = [
    ...new Set(plants.map((item) => item.category).filter(Boolean)),
  ];

  const filteredPlants = plants.filter(
    (item) =>
      (!category || item.category === category) &&
      (!Array.isArray(item.environment) ||
        item.environment.length === 0 ||
        item.environment.includes(env)),
  );

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPlantId("");
  };

  const calculateMix = async () => {
    if (!plantId) {
      alert("Please select a plant.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (!category) {
      alert("Please select a plant category.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/mix/calculate", {
        plantId,
        quantityKg: Number(quantity),
        environment: env,
        category,
      });

      setResult(response.data);
      setAddedToCart(false);
      setStep(5);
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to calculate the custom mix.",
      );
    } finally {
      setLoading(false);
    }
  };

  const addMixToCart = () => {
    if (!result?.customMixId) {
      alert("The custom mix was not saved. Please calculate it again.");
      return;
    }

    const selectedPlant = plants.find((item) => item._id === plantId);

    const customMix = {
      type: "custom-mix",

      // This ID is the authoritative MongoDB CustomMix document.
      customMixId: result.customMixId,

      // Frontend-only cart identity.
      cartItemId: `custom-mix-${Date.now()}`,

      name: `Custom ${
        result.plant?.name || selectedPlant?.name || "Plant"
      } Growing Mix`,

      plantId: result.plant?._id || selectedPlant?._id || plantId,

      plantName: result.plant?.name || selectedPlant?.name || "Custom Plant",

      scientificName:
        result.plant?.scientificName || selectedPlant?.scientificName || "",

      environment: result.environment || env,
      category: result.category || category,
      quantityKg: Number(result.quantityKg || quantity),
      quantity: 1,

      ingredients: (result.ingredients || []).map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        name: ingredient.name,
        percentage: Number(ingredient.percentage),
        quantityKg: Number(ingredient.quantityKg),
      })),

      ingredientCost: Number(result.ingredientCost || 0),
      processing: Number(result.processing || 0),
      packaging: Number(result.packaging || 0),
      profitMargin: Number(result.profitMargin || 0),

      price: Number(result.totalPrice || 0),
      totalPrice: Number(result.totalPrice || 0),

      image: result.plant?.image || selectedPlant?.image || "",

      disclaimer:
        result.disclaimer ||
        "Demonstration formulation. Commercial formulations should be validated by a qualified horticultural professional.",
    };

    addToCart(customMix);
    setAddedToCart(true);
  };

  const startOver = () => {
    setResult(null);
    setAddedToCart(false);
    setStep(1);
    setEnv("Indoor");
    setCategory("");
    setPlantId("");
    setQuantity(5);
  };

  return (
    <section className="mixPage">
      <div className="mixHeader">
        <span className="eyebrow">SMART MIX ENGINE</span>
        <h1>Build a mix around your plant.</h1>
        <p>
          A guided experience using CocoGrow&apos;s database and demonstration
          mix rules.
        </p>
      </div>

      {step < 5 && (
        <div className="wizard">
          <div className="progress">
            {["Environment", "Category", "Plant", "Quantity"].map(
              (label, index) => {
                const number = index + 1;

                return (
                  <div
                    key={label}
                    className={
                      step > number ? "done" : step === number ? "active" : ""
                    }
                  >
                    <b>{step > number ? <Check size={15} /> : number}</b>
                    <span>{label}</span>
                  </div>
                );
              },
            )}
          </div>

          {step === 1 && (
            <div className="wizardBody">
              <h2>Where will you grow your plant?</h2>

              <div className="optionGrid">
                {ENVIRONMENTS.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    className={env === item.name ? "selected" : ""}
                    onClick={() => setEnv(item.name)}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="btn primary next"
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="wizardBody">
              <h2>What type of plant is it?</h2>

              {!categories.length ? (
                <div className="emptyState">No plant categories available.</div>
              ) : (
                <div className="optionGrid small">
                  {categories.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={category === item ? "selected" : ""}
                      onClick={() => handleCategoryChange(item)}
                    >
                      <span>🌱</span>
                      {item}
                    </button>
                  ))}
                </div>
              )}

              <div className="wizardActions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft /> Back
                </button>

                <button
                  type="button"
                  className="btn primary"
                  disabled={!category}
                  onClick={() => setStep(3)}
                >
                  Continue <ArrowRight />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizardBody">
              <h2>Which plant do you have?</h2>

              {plantsLoading ? (
                <div className="loading">Loading plants...</div>
              ) : !filteredPlants.length ? (
                <div className="emptyState">
                  <Leaf size={32} />
                  <h3>No plants found</h3>
                  <p>Choose another environment or category.</p>
                </div>
              ) : (
                <div className="plantChoices">
                  {filteredPlants.map((item) => (
                    <button
                      type="button"
                      key={item._id}
                      className={plantId === item._id ? "selected" : ""}
                      onClick={() => setPlantId(item._id)}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="plantPlaceholder">
                          <Leaf size={28} />
                        </div>
                      )}

                      <span>{item.name}</span>
                      <small>{item.scientificName || ""}</small>
                    </button>
                  ))}
                </div>
              )}

              <div className="wizardActions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft /> Back
                </button>

                <button
                  type="button"
                  className="btn primary"
                  disabled={!plantId}
                  onClick={() => setStep(4)}
                >
                  Continue <ArrowRight />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="wizardBody">
              <h2>How much growing mix do you need?</h2>

              <div className="quantity">
                <div className="qtyChoices">
                  {[1, 2, 5, 10].map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={Number(quantity) === value ? "selected" : ""}
                      onClick={() => setQuantity(value)}
                    >
                      {value} KG
                    </button>
                  ))}
                </div>

                <label>
                  Custom quantity (KG)
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </label>
              </div>

              <div className="wizardActions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setStep(3)}
                >
                  <ArrowLeft /> Back
                </button>

                <button
                  type="button"
                  className="btn primary"
                  disabled={loading || !quantity || Number(quantity) <= 0}
                  onClick={calculateMix}
                >
                  {loading ? "Calculating..." : "Calculate My Mix"}
                  <ArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 5 && result && (
        <div className="mixResult">
          <div className="resultTop">
            <div>
              <span className="eyebrow">YOUR CUSTOM MIX</span>
              <h2>
                {result.plant?.name || "Custom Plant"} ·{" "}
                {result.quantityKg || quantity} KG
              </h2>
              <p>Calculated from the active demonstration rule.</p>
            </div>

            <div className="priceBox">
              <span>Final price</span>
              <strong>₹{Number(result.totalPrice || 0).toFixed(2)}</strong>
            </div>
          </div>

          <div className="breakdown">
            {(result.ingredients || []).map((item) => (
              <div className="mixRow" key={item.ingredientId}>
                <div>
                  <b>{item.name}</b>
                  <span>{item.percentage}%</span>
                </div>

                <div className="bar">
                  <i
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>

                <strong>{item.quantityKg} KG</strong>
              </div>
            ))}
          </div>

          <div className="costGrid">
            <div>
              Ingredients
              <b>₹{Number(result.ingredientCost || 0).toFixed(2)}</b>
            </div>
            <div>
              Processing
              <b>₹{Number(result.processing || 0).toFixed(2)}</b>
            </div>
            <div>
              Packaging
              <b>₹{Number(result.packaging || 0).toFixed(2)}</b>
            </div>
            <div>
              Margin
              <b>₹{Number(result.profitMargin || 0).toFixed(2)}</b>
            </div>
          </div>

          <div className="notice">
            <Leaf size={18} />
            <span>
              {result.disclaimer || "This is a demonstration formulation."}
            </span>
          </div>

          <div className="wizardActions">
            <button type="button" className="btn ghost" onClick={startOver}>
              Start over
            </button>

            {!addedToCart ? (
              <button
                type="button"
                className="btn primary"
                onClick={addMixToCart}
              >
                <ShoppingCart size={18} />
                Add Custom Mix to Cart
                <ArrowRight />
              </button>
            ) : (
              <button
                type="button"
                className="btn primary"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart size={18} />
                Go to Cart
                <ArrowRight />
              </button>
            )}
          </div>

        </div>
      )}
    </section>
  );
}
