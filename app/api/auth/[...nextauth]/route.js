/**
 * Auth.js v5 App Router handler.
 *
 * This is the only file in the app/ directory — everything else uses
 * Pages Router. Next.js 15 supports this hybrid approach natively.
 *
 * The handlers (GET + POST) manage all /api/auth/* traffic:
 * signin, callback, signout, session, csrf, providers.
 */
import { handlers } from '../../../../auth';

export const { GET, POST } = handlers;
