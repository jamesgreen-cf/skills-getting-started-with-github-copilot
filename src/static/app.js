document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  let messageHideTimeoutId;

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    // Clear any existing hide timer before starting a new one
    if (messageHideTimeoutId !== undefined) {
      clearTimeout(messageHideTimeoutId);
    }

    // Hide message after 5 seconds
    messageHideTimeoutId = setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and reset activity options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participants = details.participants || [];
        const spotsLeft = details.max_participants - participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p class="participants-title">Participants</p>
            <ul class="participants-list"></ul>
          </div>
        `;

        const participantsList = activityCard.querySelector(".participants-list");

        if (participants.length === 0) {
          const emptyItem = document.createElement("li");
          emptyItem.className = "participant-empty";
          emptyItem.textContent = "No students registered yet";
          participantsList.appendChild(emptyItem);
        } else {
          participants.forEach((participantEmail) => {
            const participantItem = document.createElement("li");
            participantItem.className = "participant-item";

            const participantEmailLabel = document.createElement("span");
            participantEmailLabel.className = "participant-email";
            participantEmailLabel.textContent = participantEmail;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "participant-delete-btn";
            deleteButton.dataset.activity = name;
            deleteButton.dataset.email = participantEmail;
            deleteButton.title = "Unregister participant";
            deleteButton.setAttribute("aria-label", `Unregister ${participantEmail} from ${name}`);

            const deleteIcon = document.createElement("span");
            deleteIcon.className = "participant-delete-icon";
            deleteIcon.innerHTML = "&times;";
            deleteButton.appendChild(deleteIcon);

            participantItem.appendChild(participantEmailLabel);
            participantItem.appendChild(deleteButton);
            participantsList.appendChild(participantItem);
          });
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const deleteButton = event.target.closest(".participant-delete-btn");
    if (!deleteButton) {
      return;
    }

    const activityName = deleteButton.dataset.activity;
    const participantEmail = deleteButton.dataset.email;

    if (!activityName || !participantEmail) {
      showMessage("Could not determine participant to remove.", "error");
      return;
    }

    deleteButton.disabled = true;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(participantEmail)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "info");
        await fetchActivities();
      } else {
        showMessage(result.detail || "Failed to unregister participant.", "error");
        deleteButton.disabled = false;
      }
    } catch (error) {
      showMessage("Failed to unregister participant. Please try again.", "error");
      deleteButton.disabled = false;
      console.error("Error unregistering participant:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
