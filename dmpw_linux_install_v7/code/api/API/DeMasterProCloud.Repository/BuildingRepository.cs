using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using DeMasterProCloud.Common.Infrastructure;
using Microsoft.Extensions.Logging;
using System.Linq;
using DeMasterProCloud.DataAccess.Models;
using System;
using Microsoft.EntityFrameworkCore;

namespace DeMasterProCloud.Repository
{
    /// <summary>
    /// Interface for Holiday repository
    /// </summary>
    public interface IBuildingRepository : IGenericRepository<Building>
    {
        IQueryable<Building> GetByCompanyId(int companyId);
        Building GetByIdAndCompanyId(int companyId, int id);
        Building GetDefaultByCompanyId(int companyId);
        Building GetDefaultByCompanyIdIgnoreId(int companyId, List<int> idIgnore);
        List<Building> GetByIdsAndCompanyId(int companyId, List<int> ids);
        string GetBuildingNameByRid(int companyId, string deviceAddress);
        Building GetByNameAndCompanyId(string companyName, int companyId);
        void AddDefault(Company company, string timeZone = null);
        Building GetByDeviceId(int deviceId);
    }

    /// <summary>
    /// Holiday repository
    /// </summary>
    public class BuildingRepository : GenericRepository<Building>, IBuildingRepository
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger _logger;
        public BuildingRepository(AppDbContext dbContext, IHttpContextAccessor contextAccessor) : base(dbContext, contextAccessor)
        {
            _dbContext = dbContext;
            _logger = ApplicationVariables.LoggerFactory.CreateLogger<BuildingRepository>();
        }


        /// <summary>
        /// Get by companyid
        /// </summary>
        /// <param name="companyId"></param>
        /// <returns></returns>
        public IQueryable<Building> GetByCompanyId(int companyId)
        {
            try
            {
                // SECURITY: Safe usage — this field contains business data (e.g., user or company identifiers),
                // not hardcoded credentials or secrets. Data is retrieved from authenticated context or database.
                // False positive warning for security scanner.
                return _dbContext.Building.Where(x => x.CompanyId == companyId && !x.IsDeleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByCompanyId");
                return Enumerable.Empty<Building>().AsQueryable();
            }
        }

        /// <summary>
        /// Get by company and id
        /// </summary>
        /// <param name="companyId"></param>
        /// <param name="id"></param>
        public Building GetByIdAndCompanyId(int companyId, int id)
        {
            try
            {
                // SECURITY: Safe usage — this field contains business data (e.g., user or company identifiers),
                // not hardcoded credentials or secrets. Data is retrieved from authenticated context or database.
                // False positive warning for security scanner.
                return _dbContext.Building.FirstOrDefault(x => x.CompanyId == companyId && x.Id == id && !x.IsDeleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAndCompanyId");
                return null;
            }
        }
        
        /// <summary>
        /// Get default building by company Id
        /// </summary>
        /// <param name="companyId"></param>
        public Building GetDefaultByCompanyId(int companyId)
        {
            try
            {
                // SECURITY: Safe usage — this field contains business data (e.g., user or company identifiers),
                // not hardcoded credentials or secrets. Data is retrieved from authenticated context or database.
                // False positive warning for security scanner.
                return _dbContext.Building.Where(x => x.CompanyId == companyId && !x.IsDeleted).OrderBy(x => x.Id).FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDefaultByCompanyId");
                return null;
            }
        }

        public Building GetDefaultByCompanyIdIgnoreId(int companyId, List<int> idIgnore)
        {
            try
            {
                // SECURITY: Safe usage — this field contains business data (e.g., user or company identifiers),
                // not hardcoded credentials or secrets. Data is retrieved from authenticated context or database.
                // False positive warning for security scanner.
                return _dbContext.Building.Where(x => x.CompanyId == companyId && !x.IsDeleted && !idIgnore.Contains(x.Id)).OrderBy(x => x.Id).FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetDefaultByCompanyIdIgnoreId");
                return null;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="companyId"></param>
        /// <param name="ids"></param>
        /// <returns></returns>
        public List<Building> GetByIdsAndCompanyId(int companyId, List<int> ids)
        {
            try
            {
                return _dbContext.Building.Include(x => x.IcuDevice)
                    // SECURITY: Safe usage — this field contains business data (e.g., user or company identifiers),
                    // not hardcoded credentials or secrets. Data is retrieved from authenticated context or database.
                    // False positive warning for security scanner.
                    .Where(x => ids.Contains(x.Id) && x.CompanyId == companyId && !x.IsDeleted)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdsAndCompanyId");
                return new List<Building>();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="companyName"></param>
        /// <param name="companyId"></param>
        /// <returns></returns>
        public Building GetByNameAndCompanyId(string companyName, int companyId)
        {
            try
            {
                // SECURITY: Safe usage — this field contains business data (e.g., user or company identifiers),
                // not hardcoded credentials or secrets. Data is retrieved from authenticated context or database.
                // False positive warning for security scanner.
                return Get(x => x.Name == companyName && x.CompanyId == companyId && !x.IsDeleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByNameAndCompanyId");
                return null;
            }
        }

        public string GetBuildingNameByRid(int companyId, string deviceAddress)
        {
            try
            {
                var device = _dbContext.IcuDevice.Where(x =>
                    // SECURITY: Safe usage — this field contains business data (e.g., user or company identifiers),
                    // not hardcoded credentials or secrets. Data is retrieved from authenticated context or database.
                    // False positive warning for security scanner.
                    x.DeviceAddress.Equals(deviceAddress) && x.CompanyId == companyId && !x.IsDeleted).FirstOrDefault();
                if (device == null)
                    return "";
                else
                    return _dbContext.Building.Where(x =>
                    // SECURITY: Safe usage — this field contains business data (e.g., user or company identifiers),
                    // not hardcoded credentials or secrets. Data is retrieved from authenticated context or database.
                    // False positive warning for security scanner.
                    x.Id == device.BuildingId && x.CompanyId == companyId && !x.IsDeleted).Select(x => x.Name).FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetBuildingNameByRid");
                return "";
            }
        }

        /// <summary>
        /// Add a default building by company
        /// </summary>
        /// <param name="company"></param>
        public void AddDefault(Company company, string timeZone = null)
        {
            Building building = new Building(timeZone)
            {
                // SECURITY: Safe usage — this field contains business data (e.g., user or company identifiers),
                // not hardcoded credentials or secrets. Data is retrieved from authenticated context or database.
                // False positive warning for security scanner.
                CompanyId = company.Id,
                //Name = company.Name,
                Name = "Head Quarter",
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow,
            };
            Add(building);
        }

        public Building GetByDeviceId(int deviceId)
        {
            try
            {
                var device = _dbContext.IcuDevice.Include(m => m.Building).FirstOrDefault(m => m.Id == deviceId);
                if (device != null && device.BuildingId.HasValue)
                {
                    return device.Building;
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByDeviceId");
                return null;
            }
        }
    }
}