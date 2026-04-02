#!/usr/bin/env python3
"""Generate the author-count-growth figure as PNG."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import yaml

with open('author-count-growth.yaml') as f:
    raw = yaml.safe_load(f)

data = raw['data']
years = [d['year'] for d in data]
means = [d['mean'] for d in data]
medians = [d['median'] for d in data]

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(years, medians, 'o-', color='#4c6ef5', linewidth=2.5, markersize=6, label='Median', zorder=3)
ax.plot(years, means, 's--', color='#93c5fd', linewidth=1.8, markersize=5, label='Mean', zorder=2)
ax.fill_between(years, medians, means, alpha=0.08, color='#4c6ef5')
ax.set_xlabel('Year', fontsize=11)
ax.set_ylabel('Authors per paper', fontsize=11)
ax.set_title('Mean number of authors per paper in biomedical sciences (2003\u20132025)',
             fontsize=12, fontweight='bold', pad=12)
ax.legend(frameon=True, fancybox=True, shadow=False, fontsize=10)
ax.grid(True, alpha=0.3, linestyle='--')
ax.set_xlim(2002, 2026)
ax.xaxis.set_major_locator(ticker.MultipleLocator(4))
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
fig.text(0.99, 0.01, 'Source: OpenAlex API \u00b7 200 highly-cited articles/year \u00b7 Medicine & Biology',
         ha='right', fontsize=7, color='#9ca3af', style='italic')
plt.tight_layout()
plt.savefig('author-count-growth.png', dpi=150, bbox_inches='tight')
print('Saved author-count-growth.png')
