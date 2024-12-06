    import { container } from "tsyringe";
    import { AppDataSource } from "@src/database";

    import { UserService } from "@src/user/user.service";
    import { ProfileService } from "@src/profile/profile.service";
    import { UserController } from "@src/user/user.controller";
    import { Application } from "express";

    export function initializeIoC(): void {
    // Register the DataSource globally
    container.register("DataSource", { useValue: AppDataSource });

    // Register services
    container.register(ProfileService, { useClass: ProfileService });
    container.register(UserService, { useClass: UserService });

    // Register controllers
    container.register(UserController, { useClass: UserController });
    }

    /**
     * Centralized Controller Registration
     * Resolves controllers and sets up their routes on the Express app.
     * This just for preview, in real project we could use more sophisticated approach
     */
    export function registerControllers(app: Application): void {
    const userController = container.resolve(UserController);

    // Automatically bind controller methods to their routes
    console.log("Registering route: POST /user/non-transactional");
    app.post(
        "/user/non-transactional",
        userController.createNonTransactional.bind(userController)
    );

    console.log("Registering route: POST /user/transactional");
    app.post(
        "/user/transactional",
        userController.createTransactional.bind(userController)
    );
    }
