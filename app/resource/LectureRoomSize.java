package resource;

/**
 * 강의실 크기 구분을 위한 enum.
 * Factory에서 크기별 데코레이터를 선택할 때 사용한다.
 */
public enum LectureRoomSize {
  SMALL,
  MEDIUM,
  LARGE;

  public String getDisplayName() {
    return switch (this) {
      case SMALL -> "소형";
      case MEDIUM -> "중형";
      case LARGE -> "대형";
    };
  }

  @Override
  public String toString() {
    return getDisplayName();
  }
}
