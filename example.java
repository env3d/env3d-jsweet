import env3d.Env;

public class Room {
    private String textureTop = null;
    private String textureNorth = null;
    private String textureEast = null;
    private String textureWest = null;
}

public class Room2 {
    private String textureTop = null;
}

public class Ball {
    private float x = 5;
    private float y = 1;
    private float z = 5;
    private float rotateY = 0;
    private String model = "https://firebasestorage.googleapis.com/v0/b/env3d-blockly.appspot.com/o/files%2Fanonymous%2FPerry%20the%20Platypus.zip?alt=media&token=55341c43-162b-439d-adab-33904130676d#.zip";
    // private String model = "models/tux/tux.obj";
    // private String texture = "models/tux/tux.png";
    
    public void moveZ(double d) {
        z += d;
        if (d > 0) {
            rotateY = 0;
        } else {
            rotateY = 180;
        }
    }
    
    public void moveX(double d) {
        x += d;
        if (d > 0) {
            rotateY = 90;
        } else {
            rotateY = 270;
        }
    }
}

public class Game {
    
    private Env env;
    private Ball doty1;
    
    public Game() {
        env = new Env();
        doty1 = new Ball();
    }
    
    public void loop() {
        int currentKey = env.getKey();
        
        if (currentKey == 200) {
            // Up arrow
            doty1.moveZ(-1);
        } else if (currentKey == 208) {
            // Down arrow
            doty1.moveZ(1);
        } else if (currentKey == 203) {
            // Left arrow
            doty1.moveX(-1);
        } else if (currentKey == 205) {
            // Right arrow
            doty1.moveX(1);
        }
    }
    
    public void start() {
        env.setRoom(new Room());
        env.setCameraXYZ(5,20,5);
        env.setCameraPitch(-90);
        env.addObject(doty1);
        env.start();
    }
}
