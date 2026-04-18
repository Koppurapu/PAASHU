import { FormEvent, useEffect, useMemo, useState } from "react";

type Breed = {
  id: string;
  name: string;
  region: string;
  confidence_note: string;
};

type Prediction = {
  breed: string;
  confidence: number;
};

type PredictionResponse = {
  predicted_breed: string;
  confidence: number;
  top_predictions: Prediction[];
  source_file: string;
  status: string;
};

const API_BASE = "http://localhost:5000/api";

export default function App() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBreeds = async () => {
      try {
        const response = await fetch(`${API_BASE}/breeds`);
        if (!response.ok) {
          throw new Error("Unable to load breed catalog");
        }

        const data = (await response.json()) as { items: Breed[] };
        setBreeds(data.items);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unexpected error");
      }
    };

    loadBreeds();
  }, []);

  const heroStats = useMemo(
    () => [
      { label: "Catalog", value: `${breeds.length || 3}+ breeds` },
      { label: "Prediction", value: prediction?.predicted_breed ?? "Ready" },
      { label: "Status", value: prediction?.status ?? "Live demo" }
    ],
    [breeds.length, prediction]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Choose an image before predicting.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch(`${API_BASE}/predictions/predict`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = (await response.json()) as PredictionResponse;
      setPrediction(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">PAASHU demo slice</p>
          <h1>Breed identification for livestock teams.</h1>
          <p className="hero-copy">
            The scaffold now includes a live backend, breed catalog, and a mocked image prediction flow that the
            frontend can call directly.
          </p>
        </div>

        <div className="stats-row">
          {heroStats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="grid-layout">
        <article className="panel">
          <h2>Predict a breed</h2>
          <form onSubmit={handleSubmit} className="prediction-form">
            <label className="file-input">
              <span>Choose an animal image</span>
              <input type="file" accept="image/*" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Predicting..." : "Run prediction"}
            </button>
          </form>

          {error ? <p className="error-state">{error}</p> : null}

          {prediction ? (
            <div className="prediction-result">
              <div>
                <span>Predicted breed</span>
                <strong>{prediction.predicted_breed}</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>{Math.round(prediction.confidence * 100)}%</strong>
              </div>

              <div className="confidence-list">
                {prediction.top_predictions.map((item) => (
                  <div key={item.breed} className="confidence-row">
                    <span>{item.breed}</span>
                    <div className="confidence-bar">
                      <span style={{ width: `${Math.round(item.confidence * 100)}%` }} />
                    </div>
                    <strong>{Math.round(item.confidence * 100)}%</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="placeholder">Upload a file to see the prediction summary.</p>
          )}
        </article>

        <article className="panel">
          <h2>Breed catalog</h2>
          <div className="breed-list">
            {breeds.map((breed) => (
              <div key={breed.id} className="breed-card">
                <div>
                  <strong>{breed.name}</strong>
                  <p>{breed.region}</p>
                </div>
                <span>{breed.confidence_note}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
