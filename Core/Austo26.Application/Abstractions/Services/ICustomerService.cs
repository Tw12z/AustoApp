using Austo26.Application.DTOs.Customers;
using Austo26.Domain.Customers;

namespace Austo26.Application.Abstractions.Services;

public interface ICustomerService
{
    Task<IEnumerable<CustomerDto>> GetAllAsync();
    Task<CustomerDto?> GetByIdAsync(Guid id);
    Task<Customer> CreateAsync(CreateCustomerRequest request);
    Task UpdateAsync(Guid id, CreateCustomerRequest request);
    Task DeactivateAsync(Guid id);
}
