import axios from "axios";

const BASE_URL = "https://face-verification2.p.rapidapi.com/faceverification";

export async function verifyFaceRapidApi(frontUrl, faceUrl) {
  try {
    const encodedParams = new URLSearchParams();
    encodedParams.append("linkFile1", new URL(frontUrl));
    encodedParams.append("linkFile2", new URL(faceUrl));
    const options = {
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "77840bf22bmshb52e7e1c9942bc4p11e4bbjsnb07edd62b3f1",
        "X-RapidAPI-Host": "face-verification2.p.rapidapi.com",
      },
    };
    const response = await axios.post(BASE_URL, encodedParams, options);

    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
}
