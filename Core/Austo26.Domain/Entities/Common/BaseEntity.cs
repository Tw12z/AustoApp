using System;
using System.Collections.Generic;
using System.Text;

namespace Austo26.Domain.Entities.Common
{
    public abstract class BaseEntity
    {
        public Guid Id { get; protected set; }
        public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; protected set; }

        protected void Touch()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
