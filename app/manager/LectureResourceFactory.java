package manager;

import resource.LargeLectureRoomDecorator;
import resource.LectureRoomSize;
import resource.MediumLectureRoomDecorator;
import resource.Resource;
import resource.ReservableResource;
import resource.SimpleLectureRoom;
import resource.SmallLectureRoomDecorator;

/**
 * 강의실(ResourceType.Lecture)을 생성하는 단순 팩토리 (Factory 패턴 적용).
 * 요청된 크기별 데코레이터(소/중/대)로 감싸 반환한다. 호출자는 ResourceFactory만 사용하면 된다.
 */
public class LectureResourceFactory extends ResourceFactory {

  /**
   * 기본 크기(MEDIUM)로 생성하는 팩토리 메서드.
   */
  @Override
  public Resource createResource(String name, int deposit) {
    return createResource(name, deposit, LectureRoomSize.MEDIUM);
  }

  /**
   * 크기 선택형 팩토리 메서드 (Factory + Decorator 조합 적용 지점).
   */
  public Resource createResource(String name, int deposit, LectureRoomSize size) {
    ReservableResource base = new SimpleLectureRoom(name, deposit);

    return switch (size) {
      case SMALL -> new SmallLectureRoomDecorator(base);
      case MEDIUM -> new MediumLectureRoomDecorator(base);
      case LARGE -> new LargeLectureRoomDecorator(base);
    };
  }
}
