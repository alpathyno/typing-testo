import daftarKata from "./kata-besar.json";

export const ambilTeksAcak = (jumlah = 200) => {
  const hasil = [];
  let terakhir = "";
  while (hasil.length < jumlah) {
    const kata = daftarKata[Math.floor(Math.random() * daftarKata.length)];
    if (kata === terakhir) continue;
    hasil.push(kata);
    terakhir = kata;
  }
  return hasil.join(" ");
};