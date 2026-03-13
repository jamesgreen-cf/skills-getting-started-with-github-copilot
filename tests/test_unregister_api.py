from urllib.parse import quote

from src.app import activities


def test_unregister_removes_participant(client):
    # Arrange
    activity_name = "Gym Class"
    email = activities[activity_name]["participants"][0]
    encoded_activity_name = quote(activity_name, safe="")
    participants_before = list(activities[activity_name]["participants"])

    # Act
    response = client.delete(
        f"/activities/{encoded_activity_name}/unregister",
        params={"email": email},
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["message"] == f"Unregistered {email} from {activity_name}"
    assert email not in activities[activity_name]["participants"]
    assert len(activities[activity_name]["participants"]) == len(participants_before) - 1


def test_unregister_unknown_activity_returns_404(client):
    # Arrange
    activity_name = "Unknown Club"
    email = "student@mergington.edu"

    # Act
    response = client.delete(
        f"/activities/{quote(activity_name, safe='')}/unregister",
        params={"email": email},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_unregister_missing_participant_returns_404(client):
    # Arrange
    activity_name = "Gym Class"
    email = "not.registered@mergington.edu"

    # Act
    response = client.delete(
        f"/activities/{quote(activity_name, safe='')}/unregister",
        params={"email": email},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Participant not found in this activity"
