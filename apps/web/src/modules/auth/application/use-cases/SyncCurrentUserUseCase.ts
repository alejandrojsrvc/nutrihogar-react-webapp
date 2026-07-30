import type {
  CurrentUser,
  CurrentUserGateway,
} from '../ports/CurrentUserGateway';

export class SyncCurrentUserUseCase {
  constructor(private readonly currentUserGateway: CurrentUserGateway) {}

  execute(): Promise<CurrentUser> {
    return this.currentUserGateway.getCurrentUser();
  }
}
