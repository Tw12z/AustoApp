using Austo26.Application.DTOs.Suppliers;
using Austo26.Domain.Suppliers;

namespace Austo26.Application.Abstractions.Services;

public interface ISupplierService
{
    Task<IEnumerable<SupplierDto>> GetAllAsync();
    Task<SupplierDto?> GetByIdAsync(Guid id);
    Task<Supplier> CreateAsync(CreateSupplierRequest request);
    Task UpdateAsync(Guid id, CreateSupplierRequest request);
    Task DeactivateAsync(Guid id);
}
