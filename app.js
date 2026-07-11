const SUPABASE_URL = "https://rmlrnnktqfzoknsnwrma.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbHJubmt0cWZ6b2tuc253cm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTg5MjgsImV4cCI6MjA5OTI3NDkyOH0.Mxj_gXT_orQvKWbZhlaI7mgLwGdZEpczcCDG3MfrJOo";

const visitorId =
  localStorage.getItem("danutaVisitorId") ||
  crypto.randomUUID();

localStorage.setItem(
  "danutaVisitorId",
  visitorId
);

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const list = document.getElementById("gift-list");


async function showGifts() {

  const { data, error } = await supabaseClient
    .from("gifts")
    .select("*")
    .order("id");


  if (error) {
    console.log("Supabase klaida:", error);
    return;
  }


  list.innerHTML = "";


  data.forEach((gift) => {

    const card = document.createElement("div");

    card.className = "card";


    card.innerHTML = `

      <img 
  src="${gift.image_url}" 
  alt="${gift.title}"
  onclick="openGift(${gift.id})"
>

      <div class="content">

        <h3>${gift.title}</h3>

        <p>${gift.price ?? ""}</p>

        <p class="preview">
  ${(gift.description || "").slice(0, 90)}
  ${(gift.description && gift.description.length > 90) ? "…" : ""}
</p>

<p class="more">
  Skaityti daugiau →
</p>

        ${
          gift.reserved
          ?
          `<p class="reserved">Rezervuota</p>`
          :
          `<button onclick="reserveGift(${gift.id})">
             Rezervuoti
           </button>`
        }

      </div>

    `;


    list.appendChild(card);

  });

}



async function reserveGift(id) {


  const { data: current } = await supabaseClient
    .from("gifts")
    .select("*")
    .eq("reserved_by", visitorId);


  if (current && current.length > 0) {

    const change = confirm(
      "Jūs jau pasirinkote dovaną. Ar norite pakeisti pasirinkimą?"
    );


    if (!change) {
      return;
    }


    await supabaseClient
      .from("gifts")
      .update({
        reserved: false,
        reserved_by: null
      })
      .eq("id", current[0].id);

  }


  const { error } = await supabaseClient
    .from("gifts")
    .update({
      reserved: true,
      reserved_by: visitorId
    })
    .eq("id", id);


  if (error) {
    console.log("Rezervavimo klaida:", error);
    return;
  }


  showGifts();

}



showGifts();

async function openGift(id) {

  const { data, error } = await supabaseClient
    .from("gifts")
    .select("*")
    .eq("id", id)
    .single();


  if (error) {
    console.log(error);
    return;
  }


  document.getElementById("modal-image").src = data.image_url;

  document.getElementById("modal-title").innerText = data.title;

  document.getElementById("modal-description").innerText =
    data.description || "Aprašymo nėra.";

  document.getElementById("modal-price").innerText =
    data.price || "";


  const link = document.getElementById("modal-link");

  if (data.link) {
    link.href = data.link;
    link.style.display = "block";
  } else {
    link.style.display = "none";
  }


  document.getElementById("modal-reserve").onclick = function () {
    reserveGift(data.id);
    closeGift();
  };


  document.getElementById("gift-modal").style.display = "block";

}

function closeGift() {

  document.getElementById("gift-modal").style.display = "none";

}
