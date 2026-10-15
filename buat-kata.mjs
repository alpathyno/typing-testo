import fs from "node:fs";

// kata yang tidak mau muncul (slang, nama, dll). Tambah sendiri kalau ketemu
const buang = new Set(["nggak", "gue", "lu", "udah", "yah", "hei"]);

const kata = fs
  .readFileSync(process.argv[2], "utf8")
  .split("\n")
  .map((baris) => baris.split(" ")[0])          // ambil kata, buang angka frekuensi
  .filter((k) => /^[a-z]{3,10}$/.test(k))        // huruf kecil saja, 3-10 huruf
  .filter((k) => !buang.has(k))
  .slice(0, 3000);                               // 3000 kata paling sering muncul

fs.writeFileSync("src/kata-besar.json", JSON.stringify([...new Set(kata)]));
console.log("Selesai:", kata.length, "kata");