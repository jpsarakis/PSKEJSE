using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using PSKEJSE.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace PSKEJSE.Extensions
{
    public static class ExceptionHandlingMiddlewareExtension
    {
        public static void ConfigureExceptionHandling(this IApplicationBuilder app)
        {
            app.UseExceptionHandler(err =>
            {
                err.Run(async context =>
                {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
                if (contextFeature != null)
                {
                        var error = new SystemError()
                        {
                            ExceptionMessage = contextFeature.Error.Message,
                            InnerExceptionErrorMessage = contextFeature.Error.InnerException?.Message
                        };
                        await context.Response.WriteAsync(error.ToString());
                    }

                });

            });
        }

    }
}
