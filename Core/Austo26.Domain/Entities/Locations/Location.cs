using Austo26.Domain.Categories;
using Austo26.Domain.Entities.Common;

namespace Austo26.Domain.Entities.Locations;

public class Location : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public Guid? CategoryId { get; private set; }
    public Category? Category { get; private set; }
    public bool IsActive { get; private set; }

    protected Location()
    {
        Name = null!;
    }

    public Location(string name, string? description = null, Guid? categoryId = null)
    {
        SetName(name);
        Description = string.IsNullOrEmpty(description) ? null : description.Trim();
        CategoryId = categoryId;
        IsActive = true;
    }

    public void Rename(string newName)
    {
        SetName(newName);
        Touch();
    }
    public void ChangeDescription(string? description)
    {
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        Touch();
    }
    public void ChangeCategory(Guid? categoryId)
    {
        CategoryId = categoryId;
        Touch();
    }
    public void Deactivate()
    {
        IsActive = false;
        Touch();
    }
    public void Activate()
    {
        IsActive = true;
        Touch();
    }

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Konum adı boş olamaz.", nameof(name));

        Name = name.Trim();
    }

}