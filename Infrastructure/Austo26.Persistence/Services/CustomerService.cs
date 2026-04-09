using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Customers;
using Austo26.Application.Repositories;
using Austo26.Domain.Customers;

namespace Austo26.Persistence.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _repo;

    public CustomerService(ICustomerRepository repo) { _repo = repo; }

    public async Task<IEnumerable<CustomerDto>> GetAllAsync()
        => (await _repo.GetAllAsync()).Select(Map);

    public async Task<CustomerDto?> GetByIdAsync(Guid id)
    {
        var c = await _repo.GetByIdAsync(id);
        return c is null ? null : Map(c);
    }

    public async Task<Customer> CreateAsync(CreateCustomerRequest request)
    {
        var customer = new Customer(request.FullName, request.Phone, request.Email, request.TaxNumber, request.Notes);
        await _repo.AddAsync(customer);
        await _repo.SaveChangesAsync();
        return customer;
    }

    public async Task UpdateAsync(Guid id, CreateCustomerRequest request)
    {
        var customer = await _repo.GetByIdAsync(id) ?? throw new Exception("Müşteri bulunamadı.");
        customer.Update(request.FullName, request.Phone, request.Email, request.TaxNumber, request.Notes);
        await _repo.SaveChangesAsync();
    }

    public async Task DeactivateAsync(Guid id)
    {
        var customer = await _repo.GetByIdAsync(id) ?? throw new Exception("Müşteri bulunamadı.");
        customer.Deactivate();
        await _repo.SaveChangesAsync();
    }

    private static CustomerDto Map(Customer c)
        => new(c.Id, c.FullName, c.Phone, c.Email, c.TaxNumber, c.Notes, c.IsActive);
}
