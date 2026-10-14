export const daftarTeks = [
  "belajar sedikit setiap hari lebih baik daripada belajar banyak sekali",
  "kode yang bersih mudah dibaca dan mudah diperbaiki oleh siapa saja",
  "hujan turun perlahan sementara kopi hangat menemani malam yang tenang",
  "ketekunan mengalahkan bakat ketika bakat tidak mau berusaha keras",
  "setiap program besar dimulai dari satu baris kode yang sederhana",
];

export const ambilTeksAcak = (jumlah = 4) =>
  [...daftarTeks]
    .sort(() => Math.random() - 0.5)
    .slice(0, jumlah)
    .join(" ");