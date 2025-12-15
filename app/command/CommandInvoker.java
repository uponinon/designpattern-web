package command;

public class CommandInvoker {
    public boolean run(Command cmd) {
        return cmd.execute();
    }
}
