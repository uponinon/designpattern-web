package manager;

public enum ResourceType {
  LECTURE("강의실"),   // 강의실 예약용
  ITEM("품목");        // 대여 품목

  private final String displayName;

  ResourceType(String displayName) {
    this.displayName = displayName;
  }

  public String getDisplayName() {
    return displayName;
  }
}
