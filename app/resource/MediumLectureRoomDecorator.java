package resource;

import java.util.Date;
import user.User;

/**
 * 중형 강의실 (Decorator 패턴 적용).
 */
public class MediumLectureRoomDecorator extends ReservableDecorator {

  public MediumLectureRoomDecorator(ReservableResource decorated) {
    super(decorated);
  }

  @Override
  public String getName() {
    return decorated.getName() + " [중형]";
  }

  @Override
  public int getDeposit() {
    return decorated.getDeposit();
  }

  @Override
  public void setDeposit(int deposit) {
    decorated.setDeposit(deposit);
  }

  @Override
  public boolean reserve(Date date, TimeSlot slot, User user) {
    return decorated.reserve(date, slot, user);
  }

  @Override
  public void cancel(Date date, TimeSlot slot, User user) {
    decorated.cancel(date, slot, user);
  }

  @Override
  public void showAvailability(Date date) {
    decorated.showAvailability(date);
  }

  @Override
  public boolean isAvailable() {
    return decorated.isAvailable();
  }

  @Override
  public void setAvailable(boolean available) {
    decorated.setAvailable(available);
  }
}
