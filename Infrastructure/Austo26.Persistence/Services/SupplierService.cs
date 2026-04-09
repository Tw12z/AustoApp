using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Suppliers;
using Austo26.Application.Repositories;
using Austo26.Domain.Suppliers;

namespace Austo26.Persistence.Services;

public class SupplierService : ISupplierService
{
    private readonly ISupplierRepository _repo;

    public SupplierService(ISupplierRepository repo) { _repo = repo; }

    public async Task<IEnumerable<SupplierDto>> GetAllAsync()
        => (await _repo.GetAllAsync()).Select(Map);

    public async Task<SupplierDto?> GetByIdAsync(Guid id)
    {
        var s = await _repo.GetByIdAsync(id);
        return s is null ? null : Map(s);
    }

    public async Task<Supplier> CreateAsync(CreateSupplierRequest request)
    {
        var supplier = new Supplier(request.CompanyName, request.Phone, request.ContactName,
                                    request.Email, request.TaxNumber, request.Notes);
        await _repo.AddAsync(supplier);
        await _repo.SaveChangesAsync();
        return supplier;
    }

    public async Task UpdateAsync(Guid id, CreateSupplierRequest request)
    {
        var supplier = await _repo.GetByIdAsync(id) ?? throw new Exception("Tedarikçi bulunamadı.");
        supplier.Update(request.CompanyName, request.Phone, request.ContactName,
                        request.Email, request.TaxNumber, request.Notes);
        await _repo.SaveChangesAsync();
    }

    public async Task DeactivateAsync(Guid id)
    {
        var supplier = await _repo.GetByIdAsync(id) ?? throw new Exception("Tedarikçi bulunamadı.");
        supplier.Deactivate();
        await _repo.SaveChangesAsync();
    }

    private static SupplierDto Map(Supplier s)
        => new(s.Id, s.CompanyName, s.ContactName, s.Phone, s.Email, s.TaxNumber, s.IsActive);
}
