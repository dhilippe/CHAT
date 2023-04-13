const input = document.getElementById("input");
    const maxChar = 400;

    input.addEventListener("input", function() {
      const currentChar = input.value.length;
      if (currentChar > maxChar) {
        input.value = input.value.slice(0, maxChar);
        alert("Vous avez atteint la limite de caractères autorisée !");
      }
    });

    const form = document.getElementById("form");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      const message = input.value;
      if (message.trim()) {
        socket.emit("chat message", message);
        input.value = "";
      }
    });
