const MIN_VOLUME = 1000000;
const timeIgnore = [[1743552000, 1744588800]];

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

  // Fetch historical data for each stock symbol
  const viewData = [];
  for (const symbol of mergedData) {
    const res = await fetch(
      `https://iboard-api.ssi.com.vn/statistics/charts/history?resolution=1D&symbol=${symbol}&from=${
        Date.now() / 1000 - 365 * 24 * 60 * 60
      }&to=${Date.now() / 1000}`
    );
    const data = await res.json();
    const timeArr = data.data.t; // mảng các thời điểm theo thời gian
    const priceArr = data.data.c; // mảng các giá đóng cửa theo thời gian
    const filteredPriceArr = priceArr.filter((_, index) => {
      const time = timeArr[index];
      for (const [start, end] of timeIgnore) {
        if (time >= start && time <= end) {
          return false;
        }
      }
      return true;
    });
    const price = filteredPriceArr[filteredPriceArr.length - 1];
    const minPrice = Math.min(...filteredPriceArr);
    const maxPrice = Math.max(...filteredPriceArr);
    console.log(`${symbol}: price=${price}, minPrice=${minPrice}, maxPrice=${maxPrice}`);
    viewData.push([symbol, price / minPrice, price / maxPrice, (price - minPrice) / (maxPrice - minPrice)]);
    // await new Promise((resolve) => setTimeout(resolve, 1000)); // Thêm delay 1000ms giữa các lần gọi API
  }

  // Sort viewData by price/minPrice in ascending order
  // viewData.sort((a, b) => a[1] - b[1]);

  // Sort viewData by normalizedPrice in ascending order
  viewData.sort((a, b) => a[3] - b[3]);

  // Log the final viewData
  console.log('List of stocks (symbol, price/minPrice, price/maxPrice, normalizedPrice):');
  console.table(viewData);
})();
