"use client";
import { useEffect, useState,} from "react";
import { useParams, useRouter } from "next/navigation";
import CustomerHeader from "../../components/CustomerHeader"; // 階層に応じて調整

interface Car {
  id: number;
  manufacturer: { nameEn: string };
  carNameEn: string;
  modelCode: string;
  vinNumber: string;
  engineModel: string;
  displacement: string;
  driveType: string;
  transmission: string;
  year: number;
  month: number;
  startPrice?: number;
  images: { imageUrl: string }[];
  conditions: {
    condition: {
      id: number;
      labelEn: string;
    };
  }[]; // 🔥 正しく型を指定
}

export default function CustomerCarDetailPage() {

  
  const [car, setCar] = useState<Car | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [offer, setOffer] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  

  const router = useRouter();
  const params = useParams();
  const carId = params?.id as string;

  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/customer/login");
    }
  }, [router]);


  const [purchaseStyles, setPurchaseStyles] = useState<Record<string, { checked: boolean; value: string }>>({
    CBU: { checked: false, value: "" },
    SKD: { checked: false, value: "" },
    CKD: { checked: false, value: "" },
    "H/CUT": { checked: false, value: "" },
    EG: { checked: false, value: "" },
  });

  const [contractTerm, setContractTerm] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/customer/login");
      return;
    }

    const storedTerm = localStorage.getItem("contractTerm");
  setContractTerm(storedTerm);

    if (!carId) return;

    fetch(`http://localhost:5001/cars/${carId}`)
      .then((res) => res.json())
      .then((data) => {
        setCar(data);
        if (data.images?.length > 0) {
          setMainImage(data.images[0].imageUrl);
          setCurrentIndex(0);
        }
      });
  }, [carId, router]);

  const handleOfferSubmit = async () => {
    const customerId = localStorage.getItem("userId");
    if (!customerId || !car) return;
  
    const selectedOffers = Object.entries(purchaseStyles)
      .filter(([_, data]) => data.checked && data.value)
      .map(([style, data]) => ({
        style,
        price: Number(data.value),
      }));
  
    // 🔥 入力が1つもない場合
    if (selectedOffers.length === 0) {
      alert("❌ Please select at least one purchase style and enter the offer.");
      return;
    }
  
    // 🔥 NaN（文字入力など）をブロック
    if (selectedOffers.some((o) => isNaN(o.price))) {
      alert("❌ Please enter valid numbers only.");
      return;
    }
  
    // 🔥 スタート金額チェック
    const startPrice = car.startPrice ?? 0;
  
    const invalidOffers = selectedOffers.filter((o) =>
      o.style !== "EG" && o.price < startPrice
    );
  
    if (invalidOffers.length > 0) {
      alert("❌ Offer must be greater than or equal to start price (except EG).");
      return;
    }
  
    // 🔥 送信処理
    const res = await fetch("http://localhost:5001/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carId: Number(carId),
        customerId: Number(customerId),
        contractTerm,
        offers: selectedOffers,
      }),
    });
  
    if (res.ok) {
      alert("✅ Offer submitted successfully");
      setPurchaseStyles({
        CBU: { checked: false, value: "" },
        SKD: { checked: false, value: "" },
        CKD: { checked: false, value: "" },
        "H/CUT": { checked: false, value: "" },
        EG: { checked: false, value: "" },
      });
    } else {
      alert("❌ Failed to submit offer");
    }
  };

  if (!car) return <p>Loading...</p>;

  const isNoDocument = !!car && car.conditions.some((cond) => cond.condition.id === 1);
console.log("条件ID一覧:", car.conditions.map((c) => c.condition.id));
console.log("isNoDocument:", isNoDocument);

  return (
    <><CustomerHeader />
    <div className="car-list-container">
          <h2>{car.manufacturer.nameEn} / {car.carNameEn}</h2>

          {/* 大きな画像（クリックでモーダル） */}
          {mainImage && (
              <div style={{ marginBottom: "10px" }}>
                  <img
                      src={mainImage}
                      alt="Main"
                      style={{ width: "100%", maxHeight: "400px", objectFit: "contain", cursor: "zoom-in" }}
                      onClick={() => {
                          const index = car.images.findIndex((img) => img.imageUrl === mainImage);
                          setCurrentIndex(index >= 0 ? index : 0);
                          setIsModalOpen(true);
                      } } />
              </div>
          )}

          {/* サムネイル一覧 */}
          <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
              {car.images.map((img, idx) => (
                  <img
                      key={idx}
                      src={img.imageUrl}
                      alt={`Thumb ${idx}`}
                      style={{
                          width: "100px",
                          height: "70px",
                          objectFit: "cover",
                          cursor: "pointer",
                          border: img.imageUrl === mainImage ? "2px solid blue" : "1px solid gray",
                      }}
                      onClick={() => {
                          setMainImage(img.imageUrl);
                          setCurrentIndex(idx);
                      } } />
              ))}
          </div>

          <div className="car-info-wrapper">
  {/* 🔹 車両情報カード */}
  <div className="car-info-card">
    <h2>Vehicle information</h2>
    <p>{car.year}/{car.month}</p>
    <p>{car.modelCode} - {car.vinNumber}</p>
    <p>Engine: {car.engineModel} / {car.displacement}cc</p>
    <p>{car.driveType} / {car.transmission}</p>
    <p className="start-price">Start Price: {car.startPrice?.toLocaleString()},000 JPY</p>
  </div>

  {/* 🔹 車両状態カード */}
  <div className="car-condition-card">
    <h2>Condition</h2>
    <ul>
  {car.conditions.map((cond, idx) => (
    <li key={idx}>✅ {cond.condition.labelEn}</li>
  ))}
</ul>
  </div>
</div>

<h4>Purchase Styles</h4>
<div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
{Object.entries(purchaseStyles).map(([style, data]) => {
  const isCBU = style === "CBU";
  const shouldHide = isCBU && isNoDocument;

  if (shouldHide) return null; // 🔹 非表示にする

  return (
    <div key={style} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <input
        type="checkbox"
        checked={data.checked}
        onChange={(e) =>
          setPurchaseStyles((prev) => ({
            ...prev,
            [style]: { ...prev[style], checked: e.target.checked },
          }))
        }
      />
      <label style={{ width: "60px" }}>{style}</label>
      <input
        type="number"
        placeholder="Offer Price"
        value={data.value}
        disabled={!data.checked}
        onChange={(e) =>
          setPurchaseStyles((prev) => ({
            ...prev,
            [style]: { ...prev[style], value: e.target.value },
          }))
        }
        style={{
          flex: 1,
          padding: "0.5rem",
          borderRadius: "6px",
          border: "none",
          background: data.checked ? "rgba(255,255,255,0.2)" : "rgba(200,200,200,0.2)",
          color: "#fff",
        }}
      />
      <span style={{ whiteSpace: "nowrap" }}>,000 JPY</span>
    </div>
  );
})}
</div>

          <h4>Submit Your Offer</h4>
         
          <button onClick={handleOfferSubmit} className="employee-button">
              Submit
          </button>

          {/* モーダル表示 */}
          {isModalOpen && (
              <div
                  style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "80vw",
                      height: "100vh",
                      backgroundColor: "rgba(0,0,0,0.8)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1000,
                  }}
                  onClick={() => setIsModalOpen(false)}
              >
                  <div
                      style={{
                          position: "relative",
                          maxWidth: "90%",
                          maxHeight: "90%",
                      }}
                      onClick={(e) => e.stopPropagation()}
                  >
                      {/* 閉じるボタン */}
                      <button
                          onClick={() => setIsModalOpen(false)}
                          style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              fontSize: "24px",
                              background: "none",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                          }}
                      >
                          ✕
                      </button>

                      {/* 左矢印 */}
                      {currentIndex > 0 && (
                          <button
                              onClick={() => {
                                  const newIndex = currentIndex - 1;
                                  setCurrentIndex(newIndex);
                                  setMainImage(car.images[newIndex].imageUrl);
                              } }
                              style={{
                                  position: "absolute",
                                  left: -40,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  fontSize: "30px",
                                  background: "none",
                                  color: "white",
                                  border: "none",
                                  cursor: "pointer",
                              }}
                          >
                              ◀
                          </button>
                      )}

                      {/* 拡大画像 */}
                      <img
                          src={car.images[currentIndex].imageUrl}
                          alt={`Zoom ${currentIndex}`}
                          style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "8px" }} />

                      {/* 右矢印 */}
                      {currentIndex < car.images.length - 1 && (
                          <button
                              onClick={() => {
                                  const newIndex = currentIndex + 1;
                                  setCurrentIndex(newIndex);
                                  setMainImage(car.images[newIndex].imageUrl);
                              } }
                              style={{
                                  position: "absolute",
                                  right: -40,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  fontSize: "30px",
                                  background: "none",
                                  color: "white",
                                  border: "none",
                                  cursor: "pointer",
                              }}
                          >
                              ▶
                          </button>
                      )}
                  </div>
              </div>
          )}
      </div></>
  );
}