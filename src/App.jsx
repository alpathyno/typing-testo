import { useState, useRef, useEffect, useCallback } from "react";
import { ambilTeksAcak } from "./teks";
import "./App.css";

const PILIHAN_DURASI = [15, 30, 60];
const KUNCI_RIWAYAT = "typing-riwayat";
const KUNCI_REKOR = "typing-rekor";

// localStorage bisa error (mis. mode privat), jadi selalu dibungkus try/catch
const bacaStorage = (kunci, awal) => {
  try {
    const mentah = localStorage.getItem(kunci);
    return mentah ? JSON.parse(mentah) : awal;
  } catch {
    return awal;
  }
};

const simpanStorage = (kunci, nilai) => {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
  } catch {
    /* abaikan */
  }
};

const formatTanggal = (ms) => {
  const t = new Date(ms);
  return (
    t.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    ", " +
    t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
};

export default function App() {
  const [teks, setTeks] = useState(ambilTeksAcak);
  const [input, setInput] = useState("");
  const [fokus, setFokus] = useState(true);
  const [durasi, setDurasi] = useState(30);
  const [sisa, setSisa] = useState(30);
  const [status, setStatus] = useState("menunggu"); // menunggu | berjalan | selesai
  const inputRef = useRef(null);
  const totalKetikan = useRef(0); // semua huruf yang pernah diketik
  const totalSalah = useRef(0); // semua ketikan salah (walau sudah dihapus)
  const [riwayat, setRiwayat] = useState(() => bacaStorage(KUNCI_RIWAYAT, []));
  const [rekor, setRekor] = useState(() => bacaStorage(KUNCI_REKOR, {}));
  const [rekorBaru, setRekorBaru] = useState(false);

  useEffect(() => {
    if (status !== "berjalan") return;
    const id = setInterval(() => setSisa((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "berjalan" && sisa <= 0) setStatus("selesai");
  }, [sisa, status]);

  const handleChange = (e) => {
    if (status === "selesai") return;
    const nilai = e.target.value;
    if (nilai.length > teks.length) return;

    // hitung hanya saat menambah tepat satu huruf (backspace tidak dihitung)
    if (nilai.length === input.length + 1) {
      totalKetikan.current += 1;
      const idx = nilai.length - 1;
      if (nilai[idx] !== teks[idx]) totalSalah.current += 1;
    }

    if (status === "menunggu" && nilai.length > 0) setStatus("berjalan");
    setInput(nilai);
    if (nilai.length === teks.length) setStatus("selesai");
  };

  const mulaiUlang = useCallback(
    (durasiBaru = durasi) => {
      setDurasi(durasiBaru);
      setSisa(durasiBaru);
      setTeks(ambilTeksAcak());
      setInput("");
      setStatus("menunggu");
      setRekorBaru(false);
      totalKetikan.current = 0;
      totalSalah.current = 0;
      inputRef.current?.focus();
    },
    [durasi],
  );

  useEffect(() => {
    let tabDitekan = false;

    const onKeyDown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault(); // cegah fokus pindah ke tombol lain
        tabDitekan = true;
        return;
      }
      if (e.key === "Enter" && tabDitekan) {
        e.preventDefault();
        mulaiUlang();
      }
      tabDitekan = false;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mulaiUlang]);

  const hitungHasil = () => {
    let benar = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === teks[i]) benar++;
    }
    const waktu = Math.max(durasi - sisa, 1); // detik terpakai, minimal 1
    const wpm = Math.round(benar / 5 / (waktu / 60));
    const akurasi =
      totalKetikan.current === 0
        ? 0
        : Math.round(
            ((totalKetikan.current - totalSalah.current) /
              totalKetikan.current) *
              100,
          );
    return { wpm, akurasi, salah: totalSalah.current, waktu };
  };

  useEffect(() => {
    if (status !== "selesai") return;

    const h = hitungHasil();
    const entri = { ...h, durasi, tanggal: Date.now() };

    const riwayatBaru = [entri, ...riwayat].slice(0, 20); // simpan 20 terakhir
    setRiwayat(riwayatBaru);
    simpanStorage(KUNCI_RIWAYAT, riwayatBaru);

    const lama = rekor[durasi] ?? 0;
    if (h.wpm > lama) {
      const rekorSekarang = { ...rekor, [durasi]: h.wpm };
      setRekor(rekorSekarang);
      simpanStorage(KUNCI_REKOR, rekorSekarang);
      setRekorBaru(lama > 0); // badge hanya muncul kalau memecahkan rekor sebelumnya
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const hapusRiwayat = () => {
    if (!window.confirm("Hapus semua riwayat dan rekor?")) return;
    setRiwayat([]);
    setRekor({});
    setRekorBaru(false);
    simpanStorage(KUNCI_RIWAYAT, []);
    simpanStorage(KUNCI_REKOR, {});
  };

  const hasil = status === "selesai" ? hitungHasil() : null;
  const tampilBuram = !fokus && status !== "selesai";

  return (
    <div className="app">
      <h1>HOHOHO</h1>

      <div className="bar">
        <div className="durasi">
          {PILIHAN_DURASI.map((d) => (
            <button
              key={d}
              className={d === durasi ? "aktif" : ""}
              onClick={() => mulaiUlang(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="timer">{sisa}</div>
      </div>

      {riwayat.length > 0 && (
        <div className="riwayat">
          <div className="riwayat-kepala">
            <h2>Riwayat</h2>
            <button onClick={hapusRiwayat}>hapus</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>waktu</th>
                <th>mode</th>
                <th>wpm</th>
                <th>akurasi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.slice(0, 8).map((r) => (
                <tr key={r.tanggal}>
                  <td>{formatTanggal(r.tanggal)}</td>
                  <td>{r.durasi}s</td>
                  <td>{r.wpm}</td>
                  <td>{r.akurasi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="rekor">
        rekor {durasi}s: {rekor[durasi] ?? "-"} wpm
      </p>

      <div className="area" onClick={() => inputRef.current?.focus()}>
        <div className={`teks ${tampilBuram ? "buram" : ""}`}>
          {teks.split("").map((huruf, i) => {
            let kelas = "belum";
            if (i < input.length) {
              kelas = input[i] === huruf ? "benar" : "salah";
            }
            if (i === input.length && status !== "selesai") kelas += " kursor";
            return (
              <span key={i} className={kelas}>
                {huruf}
              </span>
            );
          })}
        </div>

        {tampilBuram && (
          <div className="overlay">Klik di sini untuk lanjut mengetik</div>
        )}

        <input
          ref={inputRef}
          className="input-tersembunyi"
          value={input}
          onChange={handleChange}
          onFocus={() => setFokus(true)}
          onBlur={() => setFokus(false)}
          readOnly={status === "selesai"}
          autoFocus
        />
      </div>

      <div className="aksi">
        <button className="ulang" onClick={() => mulaiUlang()}>
          ↻ Ulang
        </button>
        <p className="petunjuk">
          <kbd>tab</kbd> + <kbd>enter</kbd> untuk mengulang
        </p>
      </div>

      {hasil && (
        <div className="hasil">
          <div className="kartu besar">
            <span className="label">wpm</span>
            <span className="angka">{hasil.wpm}</span>
            {rekorBaru && <span className="badge">rekor baru!</span>}
          </div>
          <div className="kartu">
            <span className="label">akurasi</span>
            <span className="angka">{hasil.akurasi}%</span>
          </div>
          <div className="kartu">
            <span className="label">salah</span>
            <span className="angka">{hasil.salah}</span>
          </div>
          <div className="kartu">
            <span className="label">waktu</span>
            <span className="angka">{hasil.waktu}s</span>
          </div>
        </div>
      )}
    </div>
  );
}
