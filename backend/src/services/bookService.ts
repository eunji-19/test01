import fetch from "node-fetch";

/**
 * 검색을 위한 공통 Query
 */
const apiParam = (categoryId: number) => {
  return {
    key: process.env.INTERPARK_API_KEY,
    categoryId: categoryId,
    output: "json",
  };
};

const query = (parmas: Object) => {
  return Object.keys(parmas)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(parmas[k]))
    .join("&");
};

/**
 * 인터파크 API 호출
 * category: 베스트셀러, 신간도서, 추천도서
 * subUrl: 위에 해당하는 url ex)bestSeller.api
 */
const getBookResult = async (category: string, subUrl: string) => {
  const categoryUrl = new URL(`${process.env.INTERPARK_API_URL}/${subUrl}?`);

  /**
   * 국내도서 기준 결과 출력
   */
  const domesticParam = apiParam(100);
  const domesticQuery = query(domesticParam);

  const domesticInfo = await fetch(categoryUrl.toString() + domesticQuery);
  let domesticResult = await domesticInfo.json();

  if (domesticResult.returnCode !== "000") {
    domesticResult = {
      returnCode: domesticResult.returnCode,
      returnMessage: domesticResult.returnMessage,
    };
  }

  /**
   * 외국도서 기준 결과 출력
   */
  const foreignParam = apiParam(200);
  const foreignQuery = query(foreignParam);

  const foreignInfo = await fetch(categoryUrl.toString() + foreignQuery);
  let foreignResult = await foreignInfo.json();

  if (foreignResult.returnCode !== "000") {
    foreignResult = {
      returnCode: foreignResult.returnCode,
      returnMessage: foreignResult.returnMessage,
    };
  }

  const resultMap = {
    category: category,
    domestic: domesticResult,
    foreign: foreignResult,
  };

  return resultMap;
};

export default { getBookResult };
