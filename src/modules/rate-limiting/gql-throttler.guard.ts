import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ThrottlerGuard } from "@nestjs/throttler";


@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): { req: Record<string, unknown>; res: Record<string, unknown> } {
   const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
      
    const req = ctx.request || ctx.req;
    const res = ctx.reply || ctx.res;

    return { req, res };
  }
}