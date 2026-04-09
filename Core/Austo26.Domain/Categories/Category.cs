using Austo26.Domain.Entities.Common;

namespace Austo26.Domain.Categories;

public class Category : BaseEntity
{
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }

    protected Category() { Name = null!; }

    public Category(string name, string? description = null)
    {
        SetName(name);
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        IsActive = true;
    }

    public void Rename(string newName) { SetName(newName); Touch(); }
    public void ChangeDescription(string? description) { Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim(); Touch(); }
    public void Deactivate() { IsActive = false; Touch(); }
    public void Activate() { IsActive = true; Touch(); }

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Kategori adı boş olamaz.", nameof(name));
        Name = name.Trim();
    }
}
