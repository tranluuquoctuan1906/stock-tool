const MIN_VOLUME = 1000000;

(async function () {
  // Fetch VN100 stock data
  const vn100Res = await fetch(
    "https://iboard-query.ssi.com.vn/stock/group/VN100"
  );
  const vn100Data = await vn100Res.json();
  const vn100FilteredData = vn100Data.data
    .filter((item) => item.stockVol >= MIN_VOLUME)
    .sort((a, b) => b.stockVol - a.stockVol)
    .map((item) => item.stockSymbol);

  // Fetch VNALL stock data
  const vnallRes = await fetch(
    "https://iboard-query.ssi.com.vn/stock/group/VNALL"
  );
  const vnallData = await vnallRes.json();
  const vnallFilteredData = vnallData.data
    .filter((item) => item.stockVol >= MIN_VOLUME)
    .sort((a, b) => b.stockVol - a.stockVol)
    .map((item) => item.stockSymbol);

  // Merge and deduplicate stock symbols
  const mergedData = [...new Set([...vn100FilteredData, ...vnallFilteredData])];
  console.log("Merged data length: ", mergedData.length);
  const res = await fetch(
    `https://iboard-api.ssi.com.vn/statistics/charts/history?resolution=1D&symbol=AAA&from=${
      Date.now() / 1000 - 365 * 24 * 60 * 60
    }&to=${Date.now() / 1000}`
  );
  const data = await res.json();
  for (const symbol of mergedData) {
  }
})();
