"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import CustomerHeader from "../components/CustomerHeader"; // 階層に応じて調整
import { useRouter } from "next/navigation";


interface Car {
  id: number;
  manufacturer: { name: string };
  carName: string;
  carNameEn: string;
  modelCode: string;
  vinNumber: string;
  engineModel: string;
  displacement: string;
  driveType: string;
  transmission: string;
  year: number;
  month: number;
  images?: { imageUrl: string }[];  // ✅ optional にして安全に
  createdAt: string;
  startPrice?: number;
}

export default function CustomerCarListPage() {

  const router = useRouter(); // ✅ ここはOK

  const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/customer/login");
  } else {
    setAuthChecked(true);
  }
}, [router]);

if (!authChecked) return <p>Checking auth...</p>;

    const [cars, setCars] = useState<Car[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    const totalPages = Math.ceil(total / limit);

    useEffect(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/available?page=${page}&limit=${limit}`)
        .then((res) => res.json())
        .then((data) => {
          setCars(data.data);
          setTotal(data.total);
        })
        .catch(() => {
          alert("❌ Failed to fetch vehicle list");
        });
    }, [page]);

  return (
     <><CustomerHeader />
     <div className="car-list-container">
          <h2>🚗 Available Vehicles</h2>
          <div className="car-list">
              {cars.map((car) => (

                  <div key={car.id} className="car-card">
                      {car.images?.length ? (
                          <img
                              src={car.images[0].imageUrl}
                              alt="Thumbnail"
                              className="car-thumbnail"
                              onError={(e) => (e.currentTarget.src = "/no-image.png")} />
                      ) : (
                          <img
                              src="/no-image.png"
                              alt="No Image"
                              className="car-thumbnail" />
                      )}

                      <div className="car-details">
                          <p>{car.year}/{car.month}</p>
                          <p>{car.manufacturer.name} / {car.carNameEn}</p>
                          <p>{car.modelCode} - {car.vinNumber}</p>
                          <p>Engine: {car.engineModel} / {car.displacement}cc</p>
                          <p>{car.driveType} / {car.transmission}</p>
                          <h1 className="start-price">Start Price: {car.startPrice ? `${car.startPrice.toLocaleString()},000 JPY` : "N/A"}</h1>
                      </div>

                      <Link href={`/customer/cars/${car.id}`}>
                          <span className="car-view-button">View Details</span>
                      </Link>
                  </div>
              ))}
          </div>

          <div className="pagination">
  {Array.from({ length: totalPages }, (_, idx) => (
    <button
      key={idx}
      onClick={() => setPage(idx + 1)}
      className={page === idx + 1 ? "active-page" : ""}
    >
      {idx + 1}
    </button>
  ))}
</div>
      </div></>
  );
}