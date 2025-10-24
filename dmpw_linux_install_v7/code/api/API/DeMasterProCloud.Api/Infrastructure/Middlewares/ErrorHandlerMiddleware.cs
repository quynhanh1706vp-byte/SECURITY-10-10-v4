using System;
using System.Threading.Tasks;
using DeMasterProCloud.Common.Infrastructure;
using DeMasterProCloud.Common.Resources;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using DeMasterProCloud.DataModel.Api;
using DeMasterProCloud.DataModel.Email;
using DeMasterProCloud.Service;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using StatusCodes = Microsoft.AspNetCore.Http.StatusCodes;

namespace DeMasterProCloud.Api.Infrastructure.Middlewares
{
    /// <summary>
    /// Custom error handle middleware
    /// </summary>
    public class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger _logger;
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Ctor
        /// </summary>
        /// <param name="next"></param>
        /// <param name="logger"></param>
        /// <param name="configuration"></param>
        /// <param name="mailService"></param>
        public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger, IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Invoke
        /// </summary>
        /// <param name="context"></param>
        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);

                // Handle non-200 status codes that weren't already handled as ApiErrorResult
                // Only process if response hasn't started and status is not successful
                if (!context.Response.HasStarted && context.Response.StatusCode >= 400)
                {
                    // Check if the response body is empty or not already JSON formatted
                    if (context.Response.ContentType == null || !context.Response.ContentType.Contains("application/json"))
                    {
                        await HandleErrorAsync(context, context.Response.StatusCode, null);
                    }
                }
            }
            catch (Exception exception)
            {
                var errorMessage = $"{exception.Message}{Environment.NewLine}{exception.StackTrace}";
                _logger.LogError(errorMessage);
                await HandleErrorAsync(context, StatusCodes.Status500InternalServerError, MessageResource.SystemError);
            }
        }

        private Task HandleErrorAsync(HttpContext context, int statusCode, string errorMessage = null)
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            // Use the provided error message or get default for status code
            var response = new ApiErrorResultModel(statusCode, errorMessage);
            var payload = Helpers.JsonConvertCamelCase(response);

            return context.Response.WriteAsync(payload);
        }
    }
}
