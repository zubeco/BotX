import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

//function that loads the dots
const loader = (element) => {
  element.textContent = "";

  loadInterval = setInterval(() => {
    //appending a dot at 3ms count
    element.textContent += ".";

    //resetting the element.textContent to an empty string when the dot is upto 4
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
};

//function that animates typing experience
const typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
};

//function to generateUniqueId
const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `${timestamp}-${hexadecimalString}`;
};

//function to implement chatStripe

const chatStripe = (isAi, value, uniqueId) => {
  return `
    <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
            <div class="profile">
                <img 
                  src=${isAi ? bot : user} 
                  alt="${isAi ? "bot" : "user"}" 
                />
            </div>
            <div class="message" id=${uniqueId}>${value}</div>
        </div>
    </div>
`;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //users chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  //bot chatStripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messgeDiv = document.getElementById(uniqueId);
  loader(messgeDiv);

  //fetch data from server => Bot response
  const response = await fetch("https://botx.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messgeDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messgeDiv, parseData);
  } else {
    const err = await response.text();

    messgeDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
