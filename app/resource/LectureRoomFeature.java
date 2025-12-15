package resource;

/**
 * Special options for lecture rooms.
 */
public enum LectureRoomFeature {
  NONE("\uc77c\ubc18"),
  PROJECTOR("\ube54\ud504\ub85c\uc81d\ud130"),
  AUTO_RECORDING("\uc790\ub3d9\ub179\ud654");

  private final String displayName;

  LectureRoomFeature(String displayName) {
    this.displayName = displayName;
  }

  public String getDisplayName() {
    return displayName;
  }

  @Override
  public String toString() {
    return displayName;
  }
}
