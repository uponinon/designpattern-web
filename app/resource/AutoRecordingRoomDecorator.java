package resource;

import java.util.Date;
import user.User;

/**
 * Decorator that adds auto-recording capability to a lecture room.
 */
public class AutoRecordingRoomDecorator extends ReservableDecorator {

  public AutoRecordingRoomDecorator(ReservableResource decorated) {
    super(decorated);
  }

  public void startRecording() {
    // no-op placeholder for recording start
  }

  public void stopRecording() {
    // no-op placeholder for recording stop
  }

  @Override
  public String getName() {
    return decorated.getName() + " [\uc790\ub3d9\ub179\ud654]";
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
